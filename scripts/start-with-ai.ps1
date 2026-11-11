$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath (Split-Path -Parent $PSScriptRoot)
$keyPath = Join-Path (Get-Location) 'data/ai-key.dpapi'
if (!(Test-Path -LiteralPath $keyPath)) { throw 'Chua co khoa AI Studio duoc luu tren may nay.' }
$python = 'C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1105-1297-0_26.1105.1297.0_x64__3k8sg7r9htsxt/dependencies/python/python.exe'
if (!(Test-Path -LiteralPath $python)) { throw 'Khong tim thay Python. Cap nhat PYTHON_EXECUTABLE trong script nay.' }
$secret = Get-Content -LiteralPath $keyPath -Raw | ConvertTo-SecureString
$ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secret)
try {
  $serverPath = (Join-Path (Get-Location) 'server.mjs').Replace('/', '\')
  Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" |
    Where-Object { $_.CommandLine.Replace('/', '\') -like "*$serverPath*" } |
    ForEach-Object { Stop-Process -Id $_.ProcessId -ErrorAction Stop }
  Start-Sleep -Seconds 1
  $env:GEMINI_API_KEY = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
  $env:GEMINI_FREE_TIER_CONFIRMED = '1'
  $env:PYTHON_EXECUTABLE = $python
  Write-Host 'SafeVoice AI: http://127.0.0.1:4178'
  & node server.mjs
} finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
  Remove-Item Env:GEMINI_API_KEY,Env:GEMINI_FREE_TIER_CONFIRMED,Env:PYTHON_EXECUTABLE -ErrorAction SilentlyContinue
}
