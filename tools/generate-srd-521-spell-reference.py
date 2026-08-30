#!/usr/bin/env python3
"""Generate compact 2024 spell-reference metadata from the official SRD 5.2.1 PDF.

This script intentionally does not vendor full spell descriptions. It extracts the
verbatim stat-line metadata needed by Character Forge and emits an original,
non-quoting reference pointer for the effect text. Existing hand-curated records
remain authoritative overrides in spell-reference-2024.js.
"""

from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path

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
LEVEL_HEADER_RE = re.compile(rf"^Level ([1-9]) ({SCHOOL_RE}) \(")
CANTRIP_HEADER_RE = re.compile(rf"^({SCHOOL_RE}) Cantrip \(")
PAGE_HEADER_RE = re.compile(r"^(?:\d+\s+)?System Reference Document 5\.2\.1(?:\s+\d+)?$")
SOURCE_URL = "https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf"
EXPECTED_COUNT = 339
SPELL_PAGE_START = 106  # zero-based PDF page index; printed SRD page 107
SPELL_PAGE_END = 175    # exclusive; printed SRD page 175 is the final spell page


def slug(name: str) -> str:
    value = name.lower().replace("’", "").replace("'", "")
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-")


def clean(value: str) -> str:
    value = value.replace("\u00ad", "")
    value = value.replace("’", "'").replace("–", "-").replace("—", "-")
    value = re.sub(r"\s+", " ", value)
    return value.strip()


def resolution_for(text: str) -> str:
    lower = text.lower()
    if "ranged spell attack" in lower:
        return "Ranged spell attack"
    if "melee spell attack" in lower:
        return "Melee spell attack"
    if "spell attack" in lower:
        return "Spell attack"
    match = re.search(
        r"\b(strength|dexterity|constitution|intelligence|wisdom|charisma) saving throw\b",
        lower,
    )
    if match:
        return f"{match.group(1).title()} saving throw"
    return "Automatic or utility effect; see the official SRD reference"


def field_between(lines: list[str], label: str, next_label: str) -> str:
    start = next((i for i, line in enumerate(lines) if line.startswith(label)), None)
    end = next((i for i, line in enumerate(lines) if line.startswith(next_label)), None)
    if start is None or end is None or end <= start:
        raise ValueError(f"could not parse {label} before {next_label}")
    parts = [lines[start][len(label):].strip()]
    parts.extend(line.strip() for line in lines[start + 1:end] if line.strip())
    return clean(" ".join(parts))


def parse(pdf_path: Path) -> list[dict]:
    completed = subprocess.run(
        ["pdftotext", "-enc", "UTF-8", str(pdf_path), "-"],
        check=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    text = completed.stdout.decode("utf-8", errors="strict")
    pages = text.split("\f")
    if len(pages) < SPELL_PAGE_END:
        raise SystemExit(f"SRD PDF has only {len(pages)} extracted pages; expected at least {SPELL_PAGE_END}")

    rows: list[tuple[int, str]] = []
    for page_index in range(SPELL_PAGE_START, SPELL_PAGE_END):
        printed_page = page_index + 1
        for raw_line in pages[page_index].splitlines():
            line = clean(raw_line)
            if not line or PAGE_HEADER_RE.match(line) or line == "Spell Descriptions":
                continue
            rows.append((printed_page, line))

    headers: list[tuple[int, int, str, int]] = []
    for i, (page, line) in enumerate(rows):
        level_match = LEVEL_HEADER_RE.match(line)
        cantrip_match = CANTRIP_HEADER_RE.match(line)
        if not level_match and not cantrip_match:
            continue
        j = i - 1
        while j >= 0 and not rows[j][1]:
            j -= 1
        if j < 0:
            raise SystemExit(f"missing spell title before header: {line}")
        title = clean(rows[j][1])
        if level_match:
            level = int(level_match.group(1))
            school = level_match.group(2)
        else:
            level = 0
            school = cantrip_match.group(1)
        headers.append((i, page, title, level, school))

    records: list[dict] = []
    seen: set[str] = set()
    for n, (header_index, page, title, level, school) in enumerate(headers):
        next_header = headers[n + 1][0] if n + 1 < len(headers) else len(rows)
        # Exclude the next spell title, which immediately precedes its header.
        block_end = max(header_index + 1, next_header - 1)
        block = [line for _, line in rows[header_index + 1:block_end]]
        try:
            casting_time = field_between(block, "Casting Time:", "Range:")
            range_text = field_between(block, "Range:", "Components:")
            components = field_between(block, "Components:", "Duration:")
        except ValueError as exc:
            raise SystemExit(f"{title} (SRD p. {page}): {exc}") from exc

        duration_index = next((i for i, line in enumerate(block) if line.startswith("Duration:")), None)
        if duration_index is None:
            raise SystemExit(f"{title} (SRD p. {page}): missing Duration")
        duration = clean(block[duration_index][len("Duration:"):])
        description = clean(" ".join(block[duration_index + 1:]))
        if not description:
            raise SystemExit(f"{title} (SRD p. {page}): missing description body")

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
                "resolution": resolution_for(description),
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
        sample = ", ".join(record["name"] for record in records[:8])
        raise SystemExit(
            f"parsed {len(records)} spells, expected {EXPECTED_COUNT}; first parsed spells: {sample}"
        )
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
