#!/usr/bin/env python3
"""Generate compact 2024 spell-reference metadata from the official SRD 5.2.1 PDF.

The generated file contains the SRD stat-line metadata Character Forge needs and
short original pointers for effect/upcast text. Existing hand-curated records stay
authoritative overrides, so their richer quick-reference wording is preserved.
Generated records deliberately do not infer attack/save resolution from prose.
"""

from __future__ import annotations

import bisect
import json
import re
import sys
from pathlib import Path

import fitz  # PyMuPDF

SCHOOLS = (
    "Abjuration",
    "Conjuration",
    "Divination",
    "Enchantment",
    "Evocation",
    "Illusion",
    "Necromancy",
    "Transmutation",
)
SCHOOL_RE = "(?:" + "|".join(SCHOOLS) + ")"
# Match only the stable level/school prefix. Some SRD class lists wrap onto a
# second line, so requiring the closing parenthesis on the header line drops
# otherwise valid spells.
SPELL_HEADER_RE = re.compile(
    rf"^(?:Level ([1-9]) ({SCHOOL_RE})(?= \(|$)|({SCHOOL_RE}) Cantrip(?= \(|$)).*$",
    re.MULTILINE,
)
PAGE_HEADER_RE = re.compile(
    r"^(?:System Reference Document 5\.2\.1\n\d+|\d+\nSystem Reference Document 5\.2\.1)\s*\n?",
    re.MULTILINE,
)
SOURCE_URL = "https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf"
EXPECTED_PDF_PAGES = 364
EXPECTED_COUNT = 339
SPELL_PAGE_START = 106  # zero-based PDF page index; printed SRD page 107
SPELL_PAGE_END = 175    # exclusive; printed SRD page 175 is the final spell page


def slug(name: str) -> str:
    value = name.lower().replace("’", "").replace("'", "")
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-")


def clean(value: str) -> str:
    value = value.replace("\u00ad", "")
    value = value.replace("’", "'").replace("–", "-").replace("—", "-").replace("−", "-")
    value = value.replace("\u00a0", " ")
    value = re.sub(r"\s+", " ", value)
    return value.strip()


def normalize_page(text: str) -> str:
    text = PAGE_HEADER_RE.sub("", text)
    text = text.replace("\u00ad", "")
    text = text.replace("’", "'").replace("–", "-").replace("—", "-").replace("−", "-")
    text = text.replace("\u00a0", " ")
    return text


def parse_fields(block: str, title: str, page: int) -> tuple[str, str, str, str, str]:
    # SRD 5.2.1 itself uses both "Component:" and "Components:" in spell
    # stat lines. Treat that source-format variation as equivalent.
    patterns = {
        "Casting Time": r"Casting Time:\s*(.*?)(?=\nRange:)",
        "Range": r"Range:\s*(.*?)(?=\nComponents?:)",
        "Components": r"Components?:\s*(.*?)(?=\nDuration:)",
        "Duration": r"Duration:\s*([^\n]+)",
    }
    values: dict[str, str] = {}
    for key, pattern in patterns.items():
        match = re.search(pattern, block, re.DOTALL)
        if not match:
            raise SystemExit(f"{title} (SRD p. {page}): missing or malformed {key}")
        values[key] = clean(match.group(1))

    duration_match = re.search(r"^Duration:\s*[^\n]+", block, re.MULTILINE)
    if not duration_match:
        raise SystemExit(f"{title} (SRD p. {page}): missing Duration line")
    description = clean(block[duration_match.end():])
    if not description:
        raise SystemExit(f"{title} (SRD p. {page}): missing description body")
    return (
        values["Casting Time"],
        values["Range"],
        values["Components"],
        values["Duration"],
        description,
    )


def parse(pdf_path: Path) -> list[dict]:
    doc = fitz.open(pdf_path)
    try:
        if doc.page_count != EXPECTED_PDF_PAGES:
            raise SystemExit(
                f"SRD PDF has {doc.page_count} pages; expected {EXPECTED_PDF_PAGES}. Refusing to generate from an unexpected source file."
            )

        parts: list[str] = []
        page_starts: list[int] = []
        page_numbers: list[int] = []
        offset = 0
        for page_index in range(SPELL_PAGE_START, SPELL_PAGE_END):
            page_text = normalize_page(doc[page_index].get_text())
            if page_index == SPELL_PAGE_START:
                page_text = page_text.replace("Spell Descriptions\n", "", 1)
            page_starts.append(offset)
            page_numbers.append(page_index + 1)
            parts.append(page_text)
            offset += len(page_text) + 1
        text = "\n".join(parts)
    finally:
        doc.close()

    matches = list(SPELL_HEADER_RE.finditer(text))
    if len(matches) != EXPECTED_COUNT:
        raise SystemExit(f"found {len(matches)} spell headers, expected {EXPECTED_COUNT}")

    blocks: list[tuple[int, int, str]] = []
    for index, match in enumerate(matches):
        pre = text[:match.start()].rstrip()
        name_start = pre.rfind("\n") + 1
        title = clean(pre[name_start:])
        if not title or ":" in title:
            raise SystemExit(f"invalid spell title before header {match.group(0)!r}: {title!r}")
        if index + 1 < len(matches):
            next_pre = text[:matches[index + 1].start()].rstrip()
            block_end = next_pre.rfind("\n") + 1
        else:
            block_end = len(text)
        blocks.append((name_start, block_end, title))

    records: list[dict] = []
    seen: set[str] = set()
    for (block_start, block_end, title), match in zip(blocks, matches):
        page_pos = bisect.bisect_right(page_starts, block_start) - 1
        page = page_numbers[max(page_pos, 0)]
        block = text[block_start:block_end].strip()

        header_match = SPELL_HEADER_RE.search(block)
        if not header_match:
            raise SystemExit(f"{title} (SRD p. {page}): missing spell header")
        if header_match.group(1):
            level = int(header_match.group(1))
            school = header_match.group(2)
        else:
            level = 0
            school = header_match.group(3)

        casting_time, range_text, components, duration, description = parse_fields(block, title, page)
        spell_id = slug(title)
        if spell_id in seen:
            raise SystemExit(f"duplicate spell id parsed: {spell_id}")
        seen.add(spell_id)

        ritual = "ritual" in casting_time.lower()
        concentration = duration.lower().startswith("concentration")
        has_upcast = "using a higher-level spell slot" in description.lower()
        records.append(
            {
                "id": spell_id,
                "name": title,
                "level": level,
                "school": school,
                "castingTime": casting_time,
                "range": range_text,
                "components": components,
                "duration": duration,
                "resolution": f"See SRD 5.2.1 page {page} for spell resolution.",
                "effect": f"Official SRD 5.2.1 spell effect; see page {page} for the complete rules text.",
                "concentration": concentration,
                "ritual": ritual,
                "upcast": (
                    f"See SRD 5.2.1 page {page} for higher-level spell-slot scaling."
                    if has_upcast
                    else None
                ),
                "source": "SRD 5.2.1",
                "srdPage": page,
            }
        )

    if len(records) != EXPECTED_COUNT:
        raise SystemExit(f"parsed {len(records)} spells, expected {EXPECTED_COUNT}")
    return records


def render(records: list[dict]) -> str:
    payload = json.dumps(records, ensure_ascii=False, indent=2)
    return (
        "// AUTO-GENERATED by tools/generate-srd-521-spell-reference.py.\n"
        f"// Official source: {SOURCE_URL}\n"
        "// Do not hand-edit. Existing curated references override matching IDs.\n\n"
        f"export const SPELL_REFERENCE_2024_GENERATED=Object.freeze({payload});\n"
    )


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("usage: generate-srd-521-spell-reference.py <SRD PDF> <output JS>")
    pdf_path = Path(sys.argv[1])
    output_path = Path(sys.argv[2])
    records = parse(pdf_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(render(records), encoding="utf-8")
    print(f"generated {len(records)} SRD 5.2.1 spell references -> {output_path}")


if __name__ == "__main__":
    main()
