param (
    [string]$docxPath,
    [string]$pdfPath
)

$word = New-Object -ComObject Word.Application
$word.Visible = $false
try {
    $resolvedDocx = (Resolve-Path $docxPath).Path
    $resolvedPdf = [System.IO.Path]::GetFullPath($pdfPath)
    $doc = $word.Documents.Open($resolvedDocx)
    $wdFormatPDF = 17
    $doc.SaveAs([ref]$resolvedPdf, [ref]$wdFormatPDF)
    $pages = $doc.ComputeStatistics([Microsoft.Office.Interop.Word.WdStatistic]::wdStatisticPages)
    $doc.Close()
    Write-Host "Exported PDF successfully to $resolvedPdf with $pages pages"
} finally {
    $word.Quit()
}
