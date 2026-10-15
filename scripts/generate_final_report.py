import os
import sys
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.section import WD_SECTION_START

# Import modular chapter builders
from report_styles import (
    apply_document_settings, add_page_border, set_footer_page_number,
    format_all_document_tables
)
from report_preliminary import build_preliminary_pages
from report_ch1_to_ch3 import build_chapters_1_to_3
from report_ch4_to_ch6 import build_chapters_4_to_6
from report_ch7_to_ch9 import build_chapters_7_to_9
from report_ch10_to_end import build_chapters_10_to_end

def main():
    print("=================================================================")
    print("GENERATING COMPREHENSIVE FINAL YEAR PROJECT REPORT (55-65 PGS)")
    print("=================================================================")

    doc = docx.Document()

    # -------------------------------------------------------------------------
    # SECTION 1: Preliminary Pages (Roman Numerals)
    # -------------------------------------------------------------------------
    sec_prelim = doc.sections[0]
    sec_prelim.page_width = Inches(8.27)
    sec_prelim.page_height = Inches(11.69)
    sec_prelim.top_margin = Inches(1.0)
    sec_prelim.bottom_margin = Inches(1.0)
    sec_prelim.left_margin = Inches(1.0)
    sec_prelim.right_margin = Inches(1.0)
    add_page_border(sec_prelim)
    set_footer_page_number(sec_prelim, is_roman=True, start_num=1)

    print("--> Generating Preliminary Pages (Title, Certificate, Abstract, TOC, etc.)...")
    build_preliminary_pages(doc)

    # -------------------------------------------------------------------------
    # SECTION 2: Main Chapters (Arabic Numerals Starting at Page 1)
    # -------------------------------------------------------------------------
    sec_main = doc.add_section(WD_SECTION_START.NEW_PAGE)
    sec_main.page_width = Inches(8.27)
    sec_main.page_height = Inches(11.69)
    sec_main.top_margin = Inches(1.0)
    sec_main.bottom_margin = Inches(1.0)
    sec_main.left_margin = Inches(1.0)
    sec_main.right_margin = Inches(1.0)
    add_page_border(sec_main)
    set_footer_page_number(sec_main, is_roman=False, start_num=1)

    print("--> Generating Chapters 1 to 3 (Introduction, Related Work, Requirements)...")
    build_chapters_1_to_3(doc)

    print("--> Generating Chapters 4 to 6 (Design & Architecture, Implementation, Integration)...")
    build_chapters_4_to_6(doc)

    print("--> Generating Chapters 7 to 9 (Testing, Test Cases, Results & Discussion)...")
    build_chapters_7_to_9(doc)

    print("--> Generating Chapters 10 to 11, References, and Appendices...")
    build_chapters_10_to_end(doc)

    print("--> Applying unified compact academic table styling across all document tables...")
    format_all_document_tables(doc)

    # Save output DOCX
    output_docx = os.path.abspath("FINAL_YEAR_PROJECT_REPORT.docx")
    doc.save(output_docx)
    print(f"SUCCESS: Saved Word document to:\n   {output_docx}")

if __name__ == "__main__":
    main()
