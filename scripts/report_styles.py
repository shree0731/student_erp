import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

def apply_document_settings(doc):
    """Sets A4 size, 1-inch margins, and base styles."""
    for section in doc.sections:
        section.page_width = Inches(8.27)
        section.page_height = Inches(11.69)
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
        add_page_border(section)

def add_page_border(section):
    """Adds a neat, professional single-line page border on all four sides of every page."""
    sectPr = section._sectPr
    for child in list(sectPr):
        if child.tag.endswith('pgBorders'):
            sectPr.remove(child)
    border_xml = parse_xml(
        f'<w:pgBorders {nsdecls("w")} w:offsetFrom="page">'
        f'<w:top w:val="single" w:sz="8" w:space="24" w:color="000000"/>'
        f'<w:left w:val="single" w:sz="8" w:space="24" w:color="000000"/>'
        f'<w:bottom w:val="single" w:sz="8" w:space="24" w:color="000000"/>'
        f'<w:right w:val="single" w:sz="8" w:space="24" w:color="000000"/>'
        f'</w:pgBorders>'
    )
    sectPr.append(border_xml)

def set_footer_page_number(section, is_roman=False, start_num=None):
    """Configures centered dynamic page number field in the section footer."""
    footer = section.footer
    p = footer.paragraphs[0]
    p.text = ''
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.space_after = Pt(0)
    run = p.add_run()
    run.font.name = 'Times New Roman'
    run.font.size = Pt(11)
    run.font.color.rgb = RGBColor(50, 50, 50)
    fld = OxmlElement('w:fldSimple')
    fld.set(qn('w:instr'), 'PAGE')
    run._r.append(fld)

    sectPr = section._sectPr
    for child in list(sectPr):
        if child.tag.endswith('pgNumType'):
            sectPr.remove(child)
    pgNumType = OxmlElement('w:pgNumType')
    if is_roman:
        pgNumType.set(qn('w:fmt'), 'romanLower')
    else:
        pgNumType.set(qn('w:fmt'), 'decimal')
    if start_num is not None:
        pgNumType.set(qn('w:start'), str(start_num))
    sectPr.append(pgNumType)

def add_chapter_heading(doc, chapter_num, title):
    """Adds Chapter heading formatted in 14pt Bold Times New Roman, Centered."""
    p1 = doc.add_paragraph()
    p1.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p1.paragraph_format.space_before = Pt(12)
    p1.paragraph_format.space_after = Pt(2)
    p1.paragraph_format.keep_with_next = True
    r1 = p1.add_run(f"CHAPTER {chapter_num}")
    r1.font.name = 'Times New Roman'
    r1.font.size = Pt(14)
    r1.font.bold = True
    r1.font.color.rgb = RGBColor(0, 0, 0)

    p2 = doc.add_paragraph()
    p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p2.paragraph_format.space_before = Pt(0)
    p2.paragraph_format.space_after = Pt(12)
    p2.paragraph_format.keep_with_next = True
    r2 = p2.add_run(title.upper())
    r2.font.name = 'Times New Roman'
    r2.font.size = Pt(14)
    r2.font.bold = True
    r2.font.color.rgb = RGBColor(0, 0, 0)

def add_section_heading(doc, sec_num, title):
    """Adds Heading 2: 12pt Bold Times New Roman, Left aligned."""
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p.paragraph_format.space_before = Pt(10)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.keep_with_next = True
    r = p.add_run(f"{sec_num} {title.upper()}")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(12)
    r.font.bold = True
    r.font.color.rgb = RGBColor(0, 0, 0)

def add_subsection_heading(doc, subsec_num, title):
    """Adds Heading 3: 12pt Bold Italic Times New Roman, Left aligned."""
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p.paragraph_format.space_before = Pt(8)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.keep_with_next = True
    r = p.add_run(f"{subsec_num} {title}")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(12)
    r.font.bold = True
    r.font.italic = True
    r.font.color.rgb = RGBColor(0, 0, 0)

def add_body_paragraph(doc, text):
    """Adds standard body paragraph: Times New Roman 12pt, 1.28 line spacing, Justified."""
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(2.5)
    p.paragraph_format.line_spacing = 1.28
    r = p.add_run(text)
    r.font.name = 'Times New Roman'
    r.font.size = Pt(12)
    r.font.color.rgb = RGBColor(0, 0, 0)
    return p

def add_bullet_item(doc, text, bold_prefix=None):
    """Adds a clean bullet item with 1.25 line spacing."""
    p = doc.add_paragraph(style='List Bullet')
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.25
    if bold_prefix:
        r_pre = p.add_run(bold_prefix + ": ")
        r_pre.font.name = 'Times New Roman'
        r_pre.font.size = Pt(12)
        r_pre.font.bold = True
        r_pre.font.color.rgb = RGBColor(0, 0, 0)
    r = p.add_run(text)
    r.font.name = 'Times New Roman'
    r.font.size = Pt(12)
    r.font.color.rgb = RGBColor(0, 0, 0)
    return p

def style_table(table, col_widths=None):
    """Applies professional academic styling to table with borders and header shading."""
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'<w:top w:val="single" w:sz="6" w:space="0" w:color="333333"/>'
        f'<w:left w:val="single" w:sz="6" w:space="0" w:color="333333"/>'
        f'<w:bottom w:val="single" w:sz="6" w:space="0" w:color="333333"/>'
        f'<w:right w:val="single" w:sz="6" w:space="0" w:color="333333"/>'
        f'<w:insideH w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>'
        f'<w:insideV w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(borders)

    # Header row formatting
    header_tr = table.rows[0]._tr.get_or_add_trPr()
    header_tr.append(parse_xml(f'<w:tblHeader {nsdecls("w")}/>'))
    for cell in table.rows[0].cells:
        shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="EAEAEA"/>')
        cell._tc.get_or_add_tcPr().append(shd)
        for p in cell.paragraphs:
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p.paragraph_format.space_before = Pt(3)
            p.paragraph_format.space_after = Pt(3)
            p.paragraph_format.line_spacing = 1.0
            for r in p.runs:
                r.font.bold = True
                r.font.name = 'Times New Roman'
                r.font.size = Pt(10.0)

    # Body rows formatting
    for row in table.rows[1:]:
        trPr = row._tr.get_or_add_trPr()
        trPr.append(parse_xml(f'<w:cantSplit {nsdecls("w")}/>'))
        for i, cell in enumerate(row.cells):
            if col_widths and i < len(col_widths):
                cell.width = col_widths[i]
            for p in cell.paragraphs:
                p.paragraph_format.space_before = Pt(1.5)
                p.paragraph_format.space_after = Pt(1.5)
                p.paragraph_format.line_spacing = 1.05
                for r in p.runs:
                    r.font.name = 'Times New Roman'
                    r.font.size = Pt(8.5)

def style_prelim_table(table, col_widths=None):
    """Compact styling for preliminary pages (TOC, LOF, LOT, Abbreviations) to fit exact page budgets."""
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'<w:top w:val="single" w:sz="6" w:space="0" w:color="333333"/>'
        f'<w:left w:val="none"/>'
        f'<w:bottom w:val="single" w:sz="6" w:space="0" w:color="333333"/>'
        f'<w:right w:val="none"/>'
        f'<w:insideH w:val="single" w:sz="4" w:space="0" w:color="E5E5E5"/>'
        f'<w:insideV w:val="none"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(borders)

    # Header row formatting
    header_tr = table.rows[0]._tr.get_or_add_trPr()
    header_tr.append(parse_xml(f'<w:tblHeader {nsdecls("w")}/>'))
    for cell in table.rows[0].cells:
        shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="F5F5F5"/>')
        cell._tc.get_or_add_tcPr().append(shd)
        for p in cell.paragraphs:
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p.paragraph_format.space_before = Pt(2)
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.line_spacing = 1.0
            for r in p.runs:
                r.font.bold = True
                r.font.name = 'Times New Roman'
                r.font.size = Pt(9.0)

    # Body rows formatting
    for row in table.rows[1:]:
        trPr = row._tr.get_or_add_trPr()
        trPr.append(parse_xml(f'<w:cantSplit {nsdecls("w")}/>'))
        for i, cell in enumerate(row.cells):
            if col_widths and i < len(col_widths):
                cell.width = col_widths[i]
            for p in cell.paragraphs:
                p.paragraph_format.space_before = Pt(0.75)
                p.paragraph_format.space_after = Pt(0.75)
                p.paragraph_format.line_spacing = 1.0
                for r in p.runs:
                    r.font.name = 'Times New Roman'
                    r.font.size = Pt(8.5)

def add_table_title(doc, table_id, title):
    """Adds standardized table title caption above table."""
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p.paragraph_format.space_before = Pt(5)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.keep_with_next = True
    r = p.add_run(f"Table {table_id}: {title}")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(10.0)
    r.font.bold = True
    r.font.color.rgb = RGBColor(0, 0, 0)

def add_figure_caption(doc, figure_id, title):
    """Adds standardized figure caption below figure."""
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(5)
    r = p.add_run(f"Figure {figure_id}: {title}")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(10.0)
    r.font.bold = True
    r.font.color.rgb = RGBColor(0, 0, 0)

def add_code_block(doc, code_str, title=None):
    """Renders formatted source code listing with accent border and monospace font."""
    if title:
        p_t = doc.add_paragraph()
        p_t.paragraph_format.space_before = Pt(4)
        p_t.paragraph_format.space_after = Pt(2)
        p_t.paragraph_format.keep_with_next = True
        r_t = p_t.add_run(f"Listing: {title}")
        r_t.font.name = 'Times New Roman'
        r_t.font.bold = True
        r_t.font.size = Pt(9.5)

    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    c = tbl.cell(0, 0)
    c.width = Inches(6.27)
    tcPr = c._tc.get_or_add_tcPr()
    tcBorders = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>'
        f'<w:top w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>'
        f'<w:left w:val="single" w:sz="16" w:space="0" w:color="4F46E5"/>'
        f'<w:bottom w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>'
        f'<w:right w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>'
        f'</w:tcBorders>'
    )
    tcPr.append(tcBorders)
    tcPr.append(parse_xml(f'<w:shd {nsdecls("w")} w:fill="F8F9FA"/>'))
    p = c.paragraphs[0]
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.0
    r = p.add_run(code_str)
    r.font.name = 'Consolas'
    r.font.size = Pt(7.5)

def add_screenshot_box(doc, fig_id, fig_title, description, interaction, image_path=None):
    """Creates a formatted screenshot display box with embedded image or placeholder."""
    if image_path and os.path.exists(image_path):
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.paragraph_format.space_before = Pt(8)
        p_img.paragraph_format.space_after = Pt(4)
        p_img.paragraph_format.keep_with_next = True
        r_img = p_img.add_run()
        r_img.add_picture(image_path, width=Inches(5.6))

        add_figure_caption(doc, fig_id, fig_title)

        p_desc = doc.add_paragraph()
        p_desc.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_desc.paragraph_format.space_before = Pt(1)
        p_desc.paragraph_format.space_after = Pt(10)
        r_desc = p_desc.add_run(f"Display Scope: {description}")
        r_desc.font.italic = True
        r_desc.font.name = 'Times New Roman'
        r_desc.font.size = Pt(8.5)
        r_desc.font.color.rgb = RGBColor(90, 90, 90)
    else:
        tbl = doc.add_table(rows=1, cols=1)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        c = tbl.cell(0, 0)
        c.width = Inches(6.27)
        tcPr = c._tc.get_or_add_tcPr()
        tcBorders = parse_xml(
            f'<w:tcBorders {nsdecls("w")}>'
            f'<w:top w:val="dashed" w:sz="8" w:space="0" w:color="777777"/>'
            f'<w:left w:val="dashed" w:sz="8" w:space="0" w:color="777777"/>'
            f'<w:bottom w:val="dashed" w:sz="8" w:space="0" w:color="777777"/>'
            f'<w:right w:val="dashed" w:sz="8" w:space="0" w:color="777777"/>'
            f'</w:tcBorders>'
        )
        tcPr.append(tcBorders)
        tcPr.append(parse_xml(f'<w:shd {nsdecls("w")} w:fill="FDFDFD"/>'))

        p_in = c.paragraphs[0]
        p_in.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_in.paragraph_format.space_before = Pt(6)
        p_in.paragraph_format.space_after = Pt(6)

        r1 = p_in.add_run(f"[INSERT ACTUAL PROJECT SCREENSHOT HERE: FIGURE {fig_id}]\n\n")
        r1.font.bold = True
        r1.font.name = 'Times New Roman'
        r1.font.size = Pt(9.5)
        r1.font.color.rgb = RGBColor(60, 60, 60)

        r2 = p_in.add_run(f"Display Scope: {description}\nUser Interaction: {interaction}")
        r2.font.italic = True
        r2.font.name = 'Times New Roman'
        r2.font.size = Pt(8.5)
        r2.font.color.rgb = RGBColor(100, 100, 100)

        add_figure_caption(doc, fig_id, fig_title)

def add_ascii_diagram(doc, diagram_str, fig_id, title, explanation):
    """Renders formatted ASCII architectural/workflow diagram with caption and explanation."""
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    c = tbl.cell(0, 0)
    c.width = Inches(6.27)
    tcPr = c._tc.get_or_add_tcPr()
    tcBorders = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>'
        f'<w:top w:val="single" w:sz="6" w:space="0" w:color="6366F1"/>'
        f'<w:left w:val="single" w:sz="6" w:space="0" w:color="6366F1"/>'
        f'<w:bottom w:val="single" w:sz="6" w:space="0" w:color="6366F1"/>'
        f'<w:right w:val="single" w:sz="6" w:space="0" w:color="6366F1"/>'
        f'</w:tcBorders>'
    )
    tcPr.append(tcBorders)
    tcPr.append(parse_xml(f'<w:shd {nsdecls("w")} w:fill="FAFAFE"/>'))

    p = c.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.0
    r = p.add_run(diagram_str)
    r.font.name = 'Consolas'
    r.font.size = Pt(6.5)
    r.font.color.rgb = RGBColor(20, 20, 40)

    add_figure_caption(doc, fig_id, title)
    add_body_paragraph(doc, explanation)

def format_all_document_tables(doc):
    """Iterates through all tables in the document and applies strict academic formatting and row compactness."""
    for tbl in doc.tables:
        if len(tbl.rows) <= 1:
            continue
        first_cell_text = tbl.cell(0, 0).text.strip().upper()
        if "HEAD OF THE DEPARTMENT" in first_cell_text or "INTERNAL EXAMINER" in first_cell_text:
            continue
        
        is_prelim = any(k in first_cell_text for k in ["TOPIC", "FIGURE NO.", "TABLE NO.", "ABBREVIATION"])
        
        # Table level formatting
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        tblPr = tbl._tbl.tblPr
        for child in list(tblPr):
            if child.tag.endswith('tblBorders'):
                tblPr.remove(child)
        
        if is_prelim:
            borders = parse_xml(
                f'<w:tblBorders {nsdecls("w")}>'
                f'<w:top w:val="single" w:sz="6" w:space="0" w:color="333333"/>'
                f'<w:left w:val="none"/>'
                f'<w:bottom w:val="single" w:sz="6" w:space="0" w:color="333333"/>'
                f'<w:right w:val="none"/>'
                f'<w:insideH w:val="single" w:sz="4" w:space="0" w:color="E5E5E5"/>'
                f'<w:insideV w:val="none"/>'
                f'</w:tblBorders>'
            )
        else:
            borders = parse_xml(
                f'<w:tblBorders {nsdecls("w")}>'
                f'<w:top w:val="single" w:sz="6" w:space="0" w:color="333333"/>'
                f'<w:left w:val="single" w:sz="6" w:space="0" w:color="333333"/>'
                f'<w:bottom w:val="single" w:sz="6" w:space="0" w:color="333333"/>'
                f'<w:right w:val="single" w:sz="6" w:space="0" w:color="333333"/>'
                f'<w:insideH w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>'
                f'<w:insideV w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>'
                f'</w:tblBorders>'
            )
        tblPr.append(borders)
        
        # Header row
        header_tr = tbl.rows[0]._tr.get_or_add_trPr()
        header_tr.append(parse_xml(f'<w:tblHeader {nsdecls("w")}/>'))
        for cell in tbl.rows[0].cells:
            shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{"F0F0F0" if is_prelim else "EAEAEA"}"/>')
            cell._tc.get_or_add_tcPr().append(shd)
            for p in cell.paragraphs:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                p.paragraph_format.space_before = Pt(2)
                p.paragraph_format.space_after = Pt(2)
                p.paragraph_format.line_spacing = 1.0
                for r in p.runs:
                    r.font.bold = True
                    r.font.name = 'Times New Roman'
                    r.font.size = Pt(9.0)
                    r.font.color.rgb = RGBColor(0, 0, 0)
        
        # Body rows
        for row in tbl.rows[1:]:
            trPr = row._tr.get_or_add_trPr()
            trPr.append(parse_xml(f'<w:cantSplit {nsdecls("w")}/>'))
            for cell in row.cells:
                for p in cell.paragraphs:
                    p.paragraph_format.space_before = Pt(0.75 if is_prelim else 1.25)
                    p.paragraph_format.space_after = Pt(0.75 if is_prelim else 1.25)
                    p.paragraph_format.line_spacing = 1.0 if is_prelim else 1.05
                    for r in p.runs:
                        r.font.name = 'Times New Roman'
                        r.font.size = Pt(8.5)
                        r.font.color.rgb = RGBColor(0, 0, 0)

