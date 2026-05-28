# Add all .env keys to Vercel dashboard (production)
# Run once: pwsh -File scripts/add-vercel-env.ps1
# Skips blank values (STILL NEEDED placeholders)

$vercel  = 'C:\Users\lwbso\AppData\Roaming\npm\vercel.cmd'
$envFile = 'C:\Users\lwbso\cinematic-agency\.env'
$projDir = 'C:\Users\lwbso\cinematic-agency'
$ok = 0; $skipped = 0; $failed = 0

Set-Location $projDir

$lines = Get-Content $envFile
foreach ($line in $lines) {
    if ($line -match '^([A-Z][A-Z0-9_]+)=(.+)$') {
        $key   = $Matches[1]
        $value = $Matches[2].Trim()
        if ([string]::IsNullOrEmpty($value)) {
            Write-Host "SKIP (empty): $key"
            $skipped++
            continue
        }
        Write-Host -NoNewline "ADD $key ... "
        $result = ($value | & $vercel env add $key production --force 2>&1) -join "`n"
        if ($LASTEXITCODE -eq 0 -or $result -match 'added') {
            Write-Host "OK"
            $ok++
        } else {
            Write-Host "FAIL: $result"
            $failed++
        }
    }
}
Write-Host "`nDone. Added=$ok  Skipped=$skipped  Failed=$failed"
