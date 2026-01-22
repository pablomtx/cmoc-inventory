@echo off
echo ========================================
echo  Sistema de Gestao de Estoque CMOC
echo  Instalacao Automatica
echo ========================================
echo.

echo [1/4] Instalando dependencias do backend...
cd backend
call npm install
if errorlevel 1 (
    echo Erro ao instalar dependencias do backend!
    pause
    exit /b 1
)
echo.

echo [2/4] Configurando banco de dados...
call npx prisma generate
if errorlevel 1 (
    echo Erro ao gerar cliente Prisma!
    pause
    exit /b 1
)

call npx prisma migrate dev --name init
if errorlevel 1 (
    echo Erro ao executar migrations!
    pause
    exit /b 1
)

call npm run prisma:seed
if errorlevel 1 (
    echo Erro ao popular banco de dados!
    pause
    exit /b 1
)
echo.

echo [3/4] Instalando dependencias do frontend...
cd ..\frontend
call npm install
if errorlevel 1 (
    echo Erro ao instalar dependencias do frontend!
    pause
    exit /b 1
)
echo.

echo [4/4] Instalacao concluida!
echo.
echo ========================================
echo  Instalacao bem-sucedida!
echo ========================================
echo.
echo Para iniciar o sistema:
echo.
echo 1. Terminal 1 - Backend:
echo    cd backend
echo    npm run dev
echo.
echo 2. Terminal 2 - Frontend:
echo    cd frontend
echo    npm run dev
echo.
echo 3. Acesse: http://localhost:5173
echo.
echo Login: admin@cmoc.com
echo Senha: admin123
echo.
pause
