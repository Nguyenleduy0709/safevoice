$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath (Split-Path -Parent $PSScriptRoot)
$address = (Read-Host 'Dia chi Gmail dung de GUI ma xac nhan').Trim()
if ($address -notmatch '^[^\s@]+@gmail\.com$') { throw 'Hay nhap dia chi @gmail.com hop le.' }
$secret = Read-Host 'Mat khau ung dung Gmail (16 ky tu; khong phai mat khau Gmail thuong)' -AsSecureString
$ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secret)
try {
  $serverPath = (Join-Path (Get-Location) 'server.mjs')
  Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" |
    Where-Object { $_.CommandLine -like "*$serverPath*" } |
    ForEach-Object { Stop-Process -Id $_.ProcessId -ErrorAction Stop }
  Start-Sleep -Seconds 1
  $env:SMTP_HOST = 'smtp.gmail.com'
  $env:SMTP_PORT = '465'
  $env:SMTP_USER = $address
  $env:SMTP_FROM = $address
  $env:SMTP_PASS = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
  Write-Host 'Dang mo SafeVoice voi Gmail gui ma. Giu cua so nay mo khi thu nghiem.'
  & node server.mjs
} finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
  Remove-Item Env:SMTP_PASS,Env:SMTP_USER,Env:SMTP_FROM,Env:SMTP_HOST,Env:SMTP_PORT -ErrorAction SilentlyContinue
}
