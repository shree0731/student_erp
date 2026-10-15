param (
    [string]$docxPath = "FINAL_YEAR_PROJECT_REPORT.docx"
)

$word = New-Object -ComObject Word.Application
$word.Visible = $false
try {
    $resolvedDocx = (Resolve-Path $docxPath).Path
    $doc = $word.Documents.Open($resolvedDocx)
    
    foreach ($targetPage in @(10, 11, 12, 13, 14, 15)) {
        Write-Host "=== CONTENT ON PAGE $targetPage ==="
        $items = @()
        foreach ($p in $doc.Paragraphs) {
            $pPage = $p.Range.Information(3)
            if ($pPage -eq $targetPage) {
                $t = $p.Range.Text.Trim()
                if ($t.Length -gt 0) {
                    $items += $t.Substring(0, [System.Math]::Min(50, $t.Length))
                }
            }
        }
        Write-Host "Items count: $($items.Count)"
        if ($items.Count -gt 0) {
            Write-Host "First item: $($items[0])"
            Write-Host "Last item: $($items[$items.Count - 1])"
        }
    }
    $doc.Close()
} finally {
    $word.Quit()
}
