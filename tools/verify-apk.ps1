# verify-apk.ps1 -- Verify an APK download WITHOUT Android SDK.
# Windows PowerShell 5.1 compatible. No administrator rights required.
#
# Checks:
#   1) File SHA-256 against a published value (integrity)
#   2) Signing certificate SHA-256 read straight from the APK Signing Block (v2/v3)
#   3) Warns when the APK is signed with the public Android debug certificate
#
# Usage:
#   powershell -NoProfile -ExecutionPolicy Bypass -File verify-apk.ps1 -Path .\app.apk
#   powershell -NoProfile -ExecutionPolicy Bypass -File verify-apk.ps1 -Path .\app.apk -ExpectedSha256 31997a...
#
# Exit codes: 0 = pass, 1 = mismatch/failure, 2 = bad usage.

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$Path,
    [string]$ExpectedSha256 = '',
    [string[]]$TrustedCertSha256 = @()
)

$ErrorActionPreference = 'Stop'

function Fail([string]$msg) {
    Write-Host "[FAIL] $msg" -ForegroundColor Red
    exit 1
}

function Get-Sha256Hex([byte[]]$bytes) {
    $sha = [System.Security.Cryptography.SHA256]::Create()
    try { $h = $sha.ComputeHash($bytes) } finally { $sha.Dispose() }
    return ([System.BitConverter]::ToString($h)).Replace('-', '')
}

function Read-U32([byte[]]$b, [int]$off) {
    return [System.BitConverter]::ToUInt32($b, $off)
}
function Read-U64([byte[]]$b, [int]$off) {
    return [System.BitConverter]::ToUInt64($b, $off)
}

if (-not (Test-Path -LiteralPath $Path)) { Fail "File not found: $Path" }
$full = (Resolve-Path -LiteralPath $Path).Path
$bytes = [System.IO.File]::ReadAllBytes($full)
$len = $bytes.Length
Write-Host ''
Write-Host "File : $full"
Write-Host ("Size : {0:N0} bytes" -f $len)
Write-Host ''

# ---------- 1) Integrity ----------
$fileSha = Get-Sha256Hex $bytes
Write-Host "SHA-256 (file) : $fileSha"
if ($ExpectedSha256) {
    $e = $ExpectedSha256.Replace('-', '').Replace(':', '').Trim().ToUpperInvariant()
    if ($e.Length -ne 64) { Fail "ExpectedSha256 must be 64 hex chars (got $($e.Length))." }
    if ($e -ne $fileSha) {
        Fail "SHA-256 mismatch. The file was modified, truncated, or is not the published build.`n         expected: $e`n         actual  : $fileSha"
    }
    Write-Host '[ OK ] SHA-256 matches the published value.' -ForegroundColor Green
} else {
    Write-Host '[SKIP] No -ExpectedSha256 given; compare the line above manually.' -ForegroundColor DarkYellow
}
Write-Host ''

# ---------- 2) Signing certificate from APK Signing Block ----------
# APK Signing Block lives immediately before the Central Directory.
$eocd = -1
$scanFrom = [Math]::Max(0, $len - 65557)
for ($i = $len - 22; $i -ge $scanFrom; $i--) {
    if ($bytes[$i] -eq 0x50 -and $bytes[$i+1] -eq 0x4b -and $bytes[$i+2] -eq 0x05 -and $bytes[$i+3] -eq 0x06) { $eocd = $i; break }
}
if ($eocd -lt 0) { Fail 'Not a valid ZIP/APK: End of Central Directory not found.' }

$cdOffset = [int](Read-U32 $bytes ($eocd + 16))
if ($cdOffset -lt 32 -or $cdOffset -gt $len) { Fail 'Corrupt central directory offset.' }

$magicOffset = $cdOffset - 16
$magic = [System.Text.Encoding]::ASCII.GetString($bytes, $magicOffset, 16)
if ($magic -ne 'APK Sig Block 42') {
    Write-Host '[WARN] No APK Signing Block found (v1/JAR signing only or unsigned).' -ForegroundColor Yellow
    $certSha = $null
} else {
    # Layout: [uint64 size][pairs...][uint64 size][16-byte magic] immediately before the CD.
    # So blockStart = cdOffset - (size + 8), and pairs start at blockStart + 8.
    $blockSize64 = Read-U64 $bytes ($magicOffset - 8)
    if ($blockSize64 -gt [uint64]($cdOffset - 8)) { Fail 'Corrupt APK Signing Block size.' }
    $blockSize = [int]$blockSize64
    $blockStart = $cdOffset - $blockSize - 8
    if ($blockStart -lt 0) { Fail 'Corrupt APK Signing Block start.' }

    # Walk ID-value pairs, collect v2 (0x7109871a) and v3 (0xf05368c0)
    $schemes = @{}
    $pos = $blockStart + 8
    $limit = $magicOffset - 8
    while ($pos + 12 -le $limit) {
        $pairLen = [int](Read-U64 $bytes $pos)
        if ($pairLen -le 4) { break }
        $id = Read-U32 $bytes ($pos + 8)
        $valOff = $pos + 12
        $valLen = $pairLen - 4
        if ($id -eq 0x7109871a) { $schemes['v2'] = @($valOff, $valLen) }
        if ($id -eq 0xf05368c0) { $schemes['v3'] = @($valOff, $valLen) }
        $pos = $pos + 8 + $pairLen
    }

    if (-not $schemes.ContainsKey('v2') -and -not $schemes.ContainsKey('v3')) {
        Write-Host '[WARN] Signing block present but neither v2 nor v3 signature found.' -ForegroundColor Yellow
        $certSha = $null
    } else {
        $certSha = $null
        $certDer = $null
        $usedScheme = $null
        foreach ($name in @('v3', 'v2')) {
            if (-not $schemes.ContainsKey($name)) { continue }
            $vOff, $vLen = $schemes[$name]
            try {
                # value -> signers sequence
                $p = $vOff
                $signersLen = [int](Read-U32 $bytes $p); $p += 4
                # first signer
                $signerLen = [int](Read-U32 $bytes $p); $p += 4
                $signedDataLen = [int](Read-U32 $bytes $p); $p += 4
                $signedDataStart = $p
                # signed_data: digests (skip), then certificates
                $digestsLen = [int](Read-U32 $bytes $p); $p += 4
                $p += $digestsLen
                $certsLen = [int](Read-U32 $bytes $p); $p += 4
                $certLen = [int](Read-U32 $bytes $p); $p += 4
                $certDer = New-Object byte[] $certLen
                [Array]::Copy($bytes, $p, $certDer, 0, $certLen)
                $certSha = Get-Sha256Hex $certDer
                $usedScheme = $name
                break
            } catch {
                continue
            }
        }
        if ($certSha) {
            $formatted = ($certSha -split '(.{2})' | Where-Object { $_ } ) -join ':'
            Write-Host "Cert SHA-256   : $certSha"
            Write-Host "Cert SHA-256   : $formatted  (colon form)"
            Write-Host "Signature scheme in use: $usedScheme"
        } else {
            Write-Host '[WARN] Could not parse signer certificate from the signing block.' -ForegroundColor Yellow
        }
    }
}

if ($certSha) {
    if ($TrustedCertSha256.Count -gt 0) {
        $trusted = $TrustedCertSha256 | ForEach-Object { $_.Replace('-', '').Replace(':', '').Trim().ToUpperInvariant() }
        if ($trusted -contains $certSha) {
            Write-Host '[ OK ] Certificate matches a trusted fingerprint.' -ForegroundColor Green
        } else {
            Fail "Certificate is NOT in the trusted list. This APK was NOT signed by the expected publisher.`n         got: $certSha`n         trusted: $($trusted -join ', ')"
        }
    } else {
        Write-Host '[SKIP] No -TrustedCertSha256 given; compare the fingerprint with the download page manually.' -ForegroundColor DarkYellow
    }
}

# ---------- 3) Debug certificate detection ----------
if ($certSha -eq '3E635A55A7582B3DD83424FD4078C4FECB39AE1CA41C1B7C2AC217D3A51172BC') {
    Write-Host ''
    Write-Host '[WARN] This is the well-known Android debug certificate (CN=Android Debug).' -ForegroundColor Yellow
    Write-Host '       Its private key is public, so anyone can forge an "update" to this app.' -ForegroundColor Yellow
    Write-Host '       Do not use it for anything you distribute.' -ForegroundColor Yellow
}

Write-Host ''
Write-Host 'Done.' -ForegroundColor Green
exit 0
