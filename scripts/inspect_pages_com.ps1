param (
    [string]$docxPath = "FINAL_YEAR_PROJECT_REPORT.docx"
)

$word = New-Object -ComObject Word.Application
$word.Visible = $false
try {
    $resolvedDocx = (Resolve-Path $docxPath).Path
    $doc = $word.Documents.Open($resolvedDocx)
    
    $headings = @(
        "BONAFIDE CERTIFICATE", "CERTIFICATE OF VIVA-VOCE EXAMINATION", "ABSTRACT",
        "ACKNOWLEDGEMENT", "TABLE OF CONTENTS", "LIST OF FIGURES", "LIST OF TABLES",
        "LIST OF ABBREVIATIONS", "CHAPTER 1", "CHAPTER 2", "CHAPTER 3", "CHAPTER 4",
        "CHAPTER 5", "CHAPTER 6", "CHAPTER 7", "CHAPTER 8", "CHAPTER 9", "CHAPTER 10",
        "CHAPTER 11", "REFERENCES", "APPENDIX"
    )

    Write-Host "--- HEADINGS AND THEIR ACTUAL PAGE NUMBERS IN WORD ---"
    foreach ($p in $doc.Paragraphs) {
        $text = $p.Range.Text.Trim()
        foreach ($h in $headings) {
            if ($text.StartsWith($h)) {
                $pageNum = $p.Range.Information(3) # 3 = wdActiveEndPageNumber
                Write-Host "$h -> Page $pageNum"
                break
            }
        }
    }
    $totalPages = $doc.ComputeStatistics([Microsoft.Office.Interop.Word.WdStatistic]::wdStatisticPages)
    Write-Host "TOTAL DOCUMENT PAGES: $totalPages"
    $doc.Close()
} finally {
    $word.Quit()
}
