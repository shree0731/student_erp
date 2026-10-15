param (
    [string]$docxPath = "FINAL_YEAR_PROJECT_REPORT.docx"
)

$word = New-Object -ComObject Word.Application
$word.Visible = $false
try {
    $resolvedDocx = (Resolve-Path $docxPath).Path
    $doc = $word.Documents.Open($resolvedDocx)
    
    Write-Host "--- SECTION 2 (ARABIC FOOTER) PAGE NUMBERS ---"
    foreach ($p in $doc.Paragraphs) {
        $text = $p.Range.Text.Trim()
        if ($text.StartsWith("CHAPTER ") -or $text.StartsWith("Table ") -or $text.StartsWith("Figure ") -or $text.StartsWith("REFERENCES") -or $text.StartsWith("APPENDIX")) {
            $docPage = $p.Range.Information(3) # wdActiveEndPageNumber
            if ($docPage -ge 11) {
                $arabicPage = $docPage - 10
                Write-Host "$text -> Footer Page $arabicPage (Doc Page $docPage)"
            }
        }
    }
    $doc.Close()
} finally {
    $word.Quit()
}
