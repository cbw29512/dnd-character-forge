#!/usr/bin/env python3
"""Generate compact 2014 spell-reference metadata from the official CC SRD 5.1 PDF."""

from __future__ import annotations

import bisect
import hashlib
import json
import re
import sys
from pathlib import Path

import fitz  # PyMuPDF

SCHOOLS=("abjuration","conjuration","divination","enchantment","evocation","illusion","necromancy","transmutation")
SCHOOL_RE="(?:"+"|".join(SCHOOLS)+")"
SPELL_HEADER_RE=re.compile(rf"^(?:(1st|2nd|3rd|[4-9]th)[^\n]*?level\s+({SCHOOL_RE})|({SCHOOL_RE})\s+cantrip)(?:\s+\(ritual\))?\s*$",re.IGNORECASE|re.MULTILINE)
DURATION_RE=re.compile(r"Duration\s*:\s*((?:Concentration,?\s*)?(?:up to\s+)?(?:(?:\d+|one)\s+(?:round|minute|hour|day)s?|Instantaneous|Until dispelled(?: or triggered)?|Special|Permanent))",re.IGNORECASE)
SOURCE_URL="https://media.wizards.com/2023/downloads/dnd/SRD_CC_v5.1.pdf"
EXPECTED_PDF_PAGES=403
EXPECTED_COUNT=319
SPELL_PAGE_START=113
SPELL_PAGE_END=194
LEVELS={"1st":1,"2nd":2,"3rd":3,"4th":4,"5th":5,"6th":6,"7th":7,"8th":8,"9th":9}


def slug(name:str)->str:
    try:
        value=name.lower().replace("’","").replace("'","")
        return re.sub(r"[^a-z0-9]+","-",value).strip("-")
    except Exception as error:
        raise RuntimeError(f"failed to slug spell name {name!r}") from error


def clean(value:str)->str:
    try:
        value=value.replace("\u00ad","").replace("\u00a0"," ")
        for char in ("’","–","—","−","‐","‑"):
            value=value.replace(char,"'" if char=="’" else "-")
        return re.sub(r"\s+"," ",value).strip()
    except Exception as error:
        raise RuntimeError("failed to normalize SRD text") from error


def normalize_page(text:str)->str:
    try:
        text=text.replace("\u00ad","").replace("\u00a0"," ")
        for char in ("’","–","—","−","‐","‑"):
            text=text.replace(char,"'" if char=="’" else "-")
        return text
    except Exception as error:
        raise RuntimeError("failed to normalize SRD page") from error


def verify_source(pdf_path:Path)->tuple[str,int]:
    try:
        if not pdf_path.is_file():
            raise RuntimeError(f"SRD source file does not exist: {pdf_path}")
        payload=pdf_path.read_bytes()
        digest=hashlib.sha256(payload).hexdigest()
        doc=fitz.open(pdf_path)
        try:
            if doc.page_count!=EXPECTED_PDF_PAGES:
                raise RuntimeError(f"SRD 5.1 PDF has {doc.page_count} pages; expected {EXPECTED_PDF_PAGES}.")
            first=clean(doc[0].get_text())
            if "System Reference Document 5.1" not in first or "Creative Commons Attribution 4.0" not in first:
                raise RuntimeError("SRD 5.1 source identity/license text is missing from page 1.")
        finally:
            doc.close()
        return digest,len(payload)
    except Exception as error:
        if isinstance(error,RuntimeError): raise
        raise RuntimeError("failed to verify SRD 5.1 source") from error


def parse_fields(block:str,title:str,page:int)->tuple[str,str,str,str,str]:
    try:
        compact=clean(block)
        patterns={
            "Casting Time":r"Casting\s+Time\s*:\s*(.*?)(?=\s+Range\s*:)",
            "Range":r"Range\s*:\s*(.*?)(?=\s+Components?\s*:)",
            "Components":r"Components?\s*:\s*(.*?)(?=\s+Duration\s*:)",
        }
        values={}
        for key,pattern in patterns.items():
            match=re.search(pattern,compact,re.IGNORECASE)
            if not match:
                raise RuntimeError(f"{title} (SRD p. {page}): missing or malformed {key}")
            values[key]=clean(match.group(1))
        duration_match=DURATION_RE.search(compact)
        if not duration_match:
            raise RuntimeError(f"{title} (SRD p. {page}): missing or unsupported Duration")
        duration=clean(duration_match.group(1))
        description=clean(compact[duration_match.end():])
        if not description:
            raise RuntimeError(f"{title} (SRD p. {page}): missing description body")
        return values["Casting Time"],values["Range"],values["Components"],duration,description
    except Exception as error:
        if isinstance(error,RuntimeError): raise
        raise RuntimeError(f"failed to parse fields for {title} (SRD p. {page})") from error


def parse(pdf_path:Path)->tuple[list[dict],str,int]:
    try:
        digest,source_bytes=verify_source(pdf_path)
        doc=fitz.open(pdf_path)
        try:
            parts=[];page_starts=[];page_numbers=[];offset=0
            for page_index in range(SPELL_PAGE_START,SPELL_PAGE_END):
                page_text=normalize_page(doc[page_index].get_text())
                if page_index==SPELL_PAGE_START: page_text=page_text.replace("Spell Descriptions\n","",1)
                page_starts.append(offset);page_numbers.append(page_index+1);parts.append(page_text);offset+=len(page_text)+1
            text="\n".join(parts)
        finally:
            doc.close()
        matches=list(SPELL_HEADER_RE.finditer(text))
        if len(matches)!=EXPECTED_COUNT:
            raise RuntimeError(f"found {len(matches)} SRD 5.1 spell headers, expected {EXPECTED_COUNT}")
        records=[];seen=set()
        for index,match in enumerate(matches):
            pre=text[:match.start()].rstrip();name_start=pre.rfind("\n")+1;title=clean(pre[name_start:])
            if not title or ":" in title: raise RuntimeError(f"invalid spell title before header {match.group(0)!r}: {title!r}")
            if index+1<len(matches):
                next_pre=text[:matches[index+1].start()].rstrip();block_end=next_pre.rfind("\n")+1
            else: block_end=len(text)
            page_pos=bisect.bisect_right(page_starts,name_start)-1;page=page_numbers[max(page_pos,0)]
            ordinal=match.group(1);level=LEVELS[ordinal.lower()] if ordinal else 0;school=clean(match.group(2) or match.group(3)).title()
            casting_time,range_text,components,duration,description=parse_fields(text[name_start:block_end].strip(),title,page)
            spell_id=slug(title)
            if spell_id in seen: raise RuntimeError(f"duplicate spell id parsed: {spell_id}")
            seen.add(spell_id);ritual="(ritual)" in clean(match.group(0)).lower();concentration=duration.lower().startswith("concentration");has_upcast="at higher levels" in description.lower()
            records.append({"id":spell_id,"name":title,"level":level,"school":school,"castingTime":casting_time,"range":range_text,"components":components,"duration":duration,"resolution":f"See SRD 5.1 page {page} for spell resolution.","effect":f"Official SRD 5.1 spell effect; see page {page} for the complete rules text.","concentration":concentration,"ritual":ritual,"upcast":f"See SRD 5.1 page {page} for higher-level spell-slot scaling." if has_upcast else None,"source":"SRD 5.1","srdPage":page})
        if records[0]["id"]!="acid-arrow" or records[-1]["id"]!="zone-of-truth":
            raise RuntimeError(f"unexpected spell section boundaries: {records[0]['id']} .. {records[-1]['id']}")
        return records,digest,source_bytes
    except Exception as error:
        if isinstance(error,RuntimeError): raise
        raise RuntimeError("failed to parse SRD 5.1 spell section") from error


def render(records:list[dict],digest:str,source_bytes:int)->str:
    try:
        payload=json.dumps(records,ensure_ascii=False,indent=2)
        return "// AUTO-GENERATED by tools/generate-srd-51-spell-reference.py.\n"+f"// Official source: {SOURCE_URL}\n// Source SHA-256: {digest}\n// Source bytes: {source_bytes}\n// Do not hand-edit. Generated text is conservative source metadata, not rewritten spell rules.\n\nexport const SPELL_REFERENCE_2014_GENERATED=Object.freeze({payload});\n"
    except Exception as error:
        raise RuntimeError("failed to render generated 2014 spell references") from error


def main()->None:
    try:
        if len(sys.argv)!=3: raise RuntimeError("usage: generate-srd-51-spell-reference.py <SRD PDF> <output JS>")
        records,digest,source_bytes=parse(Path(sys.argv[1]));output_path=Path(sys.argv[2]);output_path.parent.mkdir(parents=True,exist_ok=True);output_path.write_text(render(records,digest,source_bytes),encoding="utf-8")
        print(f"source sha256={digest} bytes={source_bytes}");print(f"generated {len(records)} SRD 5.1 spell references -> {output_path}")
    except Exception as error:
        print(f"[generate-srd-51] failed: {error}",file=sys.stderr);raise SystemExit(1) from error


if __name__=="__main__": main()
