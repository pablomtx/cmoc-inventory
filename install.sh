#!/bin/bash

echo "========================================"
echo " Sistema de Gestão de Estoque CMOC"
echo " Instalação Automática"
echo "========================================"
echo ""

echo "[1/4] Instalando dependências do backend..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "Erro ao instalar dependências do backend!"
    exit 1
fi
echo ""

echo "[2/4] Configurando banco de dados..."
npx prisma generate
if [ $? -ne 0 ]; then
    echo "Erro ao gerar cliente Prisma!"
    exit 1
fi

npx prisma migrate dev --name init
if [ $? -ne 0 ]; then
    echo "Erro ao executar migrations!"
    exit 1
fi

npm run prisma:seed
if [ $? -ne 0 ]; then
    echo "Erro ao popular banco de dados!"
    exit 1
fi
echo ""

echo "[3/4] Instalando dependências do frontend..."
cd ../frontend
npm install
if [ $? -ne 0 ]; then
    echo "Erro ao instalar dependências do frontend!"
    exit 1
fi
echo ""

echo "[4/4] Instalação concluída!"
echo ""
echo "========================================"
echo " Instalação bem-sucedida!"
echo "========================================"
echo ""
echo "Para iniciar o sistema:"
echo ""
echo "1. Terminal 1 - Backend:"
echo "   cd backend"
echo "   npm run dev"
echo ""
echo "2. Terminal 2 - Frontend:"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "3. Acesse: http://localhost:5173"
echo ""
echo "Login: admin@cmoc.com"
echo "Senha: admin123"
echo ""
