import docx

doc = docx.Document('FINAL_YEAR_PROJECT_REPORT.docx')
breaks = []
for i, p in enumerate(doc.paragraphs):
    for r in p.runs:
        if 'w:br w:type="page"' in r._r.xml or 'w:type="page"' in r._r.xml:
            breaks.append((i, p.text[:50]))

print(f"Total explicit page breaks: {len(breaks)}")
for i, text in breaks:
    print(f"  P{i:03d}: {repr(text)}")
