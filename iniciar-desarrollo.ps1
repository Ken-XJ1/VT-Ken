$ErrorActionPreference = 'Stop'

$projectRoot = $PSScriptRoot
$python = Join-Path $projectRoot '.venv\Scripts\python.exe'
$frontend = Join-Path $projectRoot 'frontend'
$nodeDirectory = 'C:\Program Files\nodejs'
$npm = Join-Path $nodeDirectory 'npm.cmd'

if (-not (Test-Path $python)) {
    throw 'No encuentro .venv\Scripts\python.exe. Sigue primero la instalación de README.md.'
}
if (-not (Test-Path (Join-Path $frontend 'node_modules'))) {
    throw 'No encuentro frontend\node_modules. Abre frontend y ejecuta npm ci primero.'
}
if (-not (Test-Path $npm)) {
    throw 'No encuentro Node.js en C:\Program Files\nodejs. Instala Node.js y vuelve a abrir PowerShell.'
}

$busyPorts = @(5000, 3000) | Where-Object {
    $null -ne (Get-NetTCPConnection -LocalPort $_ -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1)
}
if ($busyPorts.Count -gt 0) {
    throw "Ya hay un proceso usando el puerto $($busyPorts -join ', '). Detén los servidores existentes con Ctrl+C y vuelve a intentarlo."
}

$env:PATH = "$nodeDirectory;$env:PATH"
$env:PGDATABASE = 'vigilancia_tropical'
$env:PGUSER = 'kenneth_dev'
$env:PGHOST = 'localhost'
$env:PGPORT = '5432'
$env:PGPASSWORD = $null

$frontendCommand = "Set-Location -LiteralPath '$frontend'; & '$npm' run dev"
Start-Process -FilePath (Join-Path $PSHOME 'powershell.exe') `
    -ArgumentList @('-NoProfile', '-NoExit', '-Command', $frontendCommand)

$securePassword = Read-Host 'Contraseña local de PostgreSQL para kenneth_dev' -AsSecureString
$passwordPointer = [IntPtr]::Zero

try {
    $passwordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
    $env:PGPASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPointer)

    Write-Host ''
    Write-Host 'Iniciando Vigilancia Tropical.'
    Write-Host 'Frontend: http://localhost:3000'
    Write-Host 'API:      http://127.0.0.1:5000'
    Write-Host 'Deja abiertas las dos ventanas. Presiona Ctrl+C aquí para detener Flask.'
    Write-Host ''

    & $python (Join-Path $projectRoot 'app.py')
    if ($LASTEXITCODE -ne 0) {
        throw "Flask terminó con código $LASTEXITCODE."
    }
}
finally {
    if ($passwordPointer -ne [IntPtr]::Zero) {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer)
    }
    Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
}
