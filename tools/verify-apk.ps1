# Windows PowerShell 5.1+. File integrity is distinct from APK signature verification.
[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)][string]$Path,
    [string]$ExpectedSha256 = '',
    [string[]]$TrustedCertSha256 = @(),
    [string]$ManifestPath = '',
    [string]$ApkSigner = '',
    [string]$JavaHome = ''
)
$ErrorActionPreference = 'Stop'
if (-not $ManifestPath) { $ManifestPath = Join-Path $PSScriptRoot 'releases.json' }
function Stop-Check([string]$message, [int]$code = 1) {
    Write-Host $message
    exit $code
}
function Normalize-Hash([string]$value) {
    $value = $value.Replace(':','').Replace('-','').Trim().ToUpperInvariant()
    if ($value -notmatch '^[0-9A-F]{64}$') { Stop-Check '[FAIL] Invalid SHA-256 value.' 2 }
    return $value
}
try {
    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) { Stop-Check '[FAIL] File not found.' 2 }
    $full = (Resolve-Path -LiteralPath $Path).Path
    $actual = (Get-FileHash -LiteralPath $full -Algorithm SHA256).Hash.ToUpperInvariant()
    Write-Host "File: $full"
    Write-Host "SHA-256: $actual"
    $published = $null
    if (-not $ExpectedSha256) {
        if (-not (Test-Path -LiteralPath $ManifestPath -PathType Leaf)) {
            Stop-Check '[UNVERIFIED] Missing releases.json. Download the complete tool ZIP or supply -ExpectedSha256.' 3
        }
        $manifest = Get-Content -LiteralPath $ManifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
        if ($manifest.version -ne 1 -or -not $manifest.files) { Stop-Check '[FAIL] Invalid release manifest.' 2 }
        $matches = @($manifest.files | Where-Object { (Normalize-Hash $_.sha256) -eq $actual })
        if ($matches.Count -ne 1) {
            Stop-Check '[UNVERIFIED] No published file matches this hash. Do not treat this file as verified.' 3
        }
        $published = $matches[0]
        $ExpectedSha256 = $published.sha256
        Write-Host "Manifest match: $($published.name)"
        if (-not $TrustedCertSha256.Count -and $published.certificateSha256) {
            $TrustedCertSha256 = @($published.certificateSha256)
        }
    }
    if ((Normalize-Hash $ExpectedSha256) -ne $actual) {
        Stop-Check '[FAIL] FILE_HASH_MISMATCH. The file differs from the expected bytes.'
    }
    $trusted = @($TrustedCertSha256 | ForEach-Object { Normalize-Hash $_ })
    # Manifest certificate is an optional extra check; an explicit certificate must always be verified.
    $explicitCertificate = $PSBoundParameters.ContainsKey('TrustedCertSha256') -and $trusted.Count -gt 0
    if (-not $ApkSigner) {
        $command = Get-Command apksigner.bat,apksigner -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($command) { $ApkSigner = $command.Source }
    }
    if (-not $ApkSigner) {
        if ($explicitCertificate) {
            Stop-Check '[UNVERIFIED] Signature check requested but apksigner is unavailable. Install Android SDK Build Tools or pass -ApkSigner.' 3
        }
        Write-Host '[OK] FILE_HASH_MATCH: bytes equal the expected file.'
        Write-Host '[INFO] SIGNATURE_NOT_CHECKED: no apksigner. File equality does not independently validate APK signatures.'
        exit 0
    }
    if (-not (Test-Path -LiteralPath $ApkSigner -PathType Leaf)) { Stop-Check '[FAIL] apksigner path does not exist.' 2 }
    if ($JavaHome) { $env:JAVA_HOME = $JavaHome }
    $previousErrorAction = $ErrorActionPreference
    try {
        $ErrorActionPreference = 'Continue'
        $signatureOutput = & $ApkSigner verify --verbose --print-certs $full 2>&1
        $signatureExit = $LASTEXITCODE
    } finally { $ErrorActionPreference = $previousErrorAction }
    if ($signatureExit -ne 0) { Stop-Check '[FAIL] APK_SIGNATURE_CHECK_FAILED: signature invalid or apksigner could not complete.' }
    $certificates = @()
    foreach ($line in $signatureOutput) {
        if ([string]$line -match '^Signer #\d+ certificate SHA-256 digest:\s*([0-9a-fA-F:]+)\s*$') {
            $certificates += Normalize-Hash $Matches[1]
        }
    }
    if ($trusted.Count -gt 0) {
        if (-not $certificates.Count) { Stop-Check '[FAIL] No signer certificate was verified.' }
        foreach ($certificate in $certificates) {
            if ($certificate -notin $trusted) { Stop-Check '[FAIL] CERTIFICATE_MISMATCH: signer is not in the expected list.' }
        }
    }
    Write-Host '[OK] FILE_HASH_MATCH: bytes equal the expected file.'
    Write-Host '[OK] APK_SIGNATURE_VERIFIED: official apksigner verification completed.'
    foreach ($certificate in $certificates) { Write-Host "Verified signer SHA-256: $certificate" }
    exit 0
} catch {
    Stop-Check ("[FAIL] " + $_.Exception.Message)
}
