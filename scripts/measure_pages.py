import os
import subprocess

def get_page_count(docx_path, pdf_path):
    cmd = [
        "powershell", "-ExecutionPolicy", "Bypass",
        "-File", "scripts/convert_docx_to_pdf.ps1",
        "-docxPath", docx_path,
        "-pdfPath", pdf_path
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    print(res.stdout)
    for line in res.stdout.splitlines():
        if "with" in line and "pages" in line:
            parts = line.split("with")
            if len(parts) > 1:
                return int(parts[1].replace("pages", "").strip())
    return None

if __name__ == "__main__":
    count = get_page_count("FINAL_YEAR_PROJECT_REPORT.docx", "FINAL_YEAR_PROJECT_REPORT.pdf")
    print(f"Current page count: {count}")
