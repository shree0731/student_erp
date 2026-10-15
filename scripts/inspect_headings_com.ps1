param (
    [string]$docxPath = "FINAL_YEAR_PROJECT_REPORT.docx"
)

$word = New-Object -ComObject Word.Application
$word.Visible = $false
try {
    $resolvedDocx = (Resolve-Path $docxPath).Path
    $doc = $word.Documents.Open($resolvedDocx)
    
    Write-Host "--- TOP-LEVEL PARAGRAPHS OUTSIDE TABLES ---"
    foreach ($p in $doc.Paragraphs) {
        # Check if paragraph is inside a table
        $inTable = $false
        try {
            if ($p.Range.Tables.Count -gt 0) {
                $inTable = $true
            }
        } catch {}

        if (-not $inTable) {
            $text = $p.Range.Text.Trim()
            if ($text.Length -gt 0 -and ($text.StartsWith("CHAPTER") -or $text -in @(
                "BONAFIDE CERTIFICATE", "CERTIFICATE OF VIVA-VOCE EXAMINATION", "ABSTRACT",
                "ACKNOWLEDGEMENT", "TABLE OF CONTENTS", "LIST OF FIGURES", "LIST OF TABLES",
                "LIST OF ABBREVIATIONS", "REFERENCES", "APPENDIX"
            ))) {
                $page = $p.Range.Information(3) # wdActiveEndPageNumber
                Write-Host "$text -> Page $page"
            }
        }
    }
    $totalPages = $doc.ComputeStatistics([Microsoft.Office.Interop.Word.WdStatistic]::wdStatisticPages)
    Write-Host "TOTAL DOCUMENT PAGES: $totalPages"
    $doc.Close()
} finally {
    $word.Quit()
}
