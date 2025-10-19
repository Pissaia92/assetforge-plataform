#!/bin/bash

# start_all_services.sh
# Script para iniciar todos os serviços do AssetForge com um único comando

echo "Iniciando todos os serviços do AssetForge..."

# --- 1. Iniciar Serviços com Docker Compose (PostgreSQL, RabbitMQ, Lifecycle Service) ---
echo "Iniciando PostgreSQL, RabbitMQ e Lifecycle Service via Docker Compose..."
cd /d/GitProjects/assetforge-plataform # Ajuste o caminho absoluto para a raiz do seu projeto
docker-compose up -d postgres_db rabbitmq lifecycle-service # Inicia apenas os serviços necessários do compose

if [ $? -ne 0 ]; then
    echo "Erro ao iniciar serviços do Docker Compose. Verifique o Docker e o docker-compose.yml."
    exit 1
fi

echo "Aguardando 10 segundos para que o PostgreSQL e RabbitMQ iniciem completamente..."
sleep 10

# --- 2. Iniciar Serviço de Diretório (NestJS) ---
echo "Iniciando o Serviço de Diretório (NestJS)..."
cd services/directory-service
# Certifique-se de que o venv do Python NÃO está ativo aqui e que o Node está disponível
# O NestJS geralmente não precisa de venv do Python
npm run start:dev > ../..//directory-service.log 2>&1 &
# O & executa em segundo plano. O > e 2>&1 redirecionam a saída para um arquivo de log.
DIRECTORY_PID=$!
cd ..

# --- 3. Iniciar Serviço de Inventário (FastAPI) ---
echo "Iniciando o Serviço de Inventário (FastAPI)..."
cd inventory-service
# Ative o ambiente virtual Python antes de iniciar o uvicorn
source venv/Scripts/activate # Use venv\Scripts\activate.bat se estiver em .bat e Windows
uvicorn main:app --reload > ../..//inventory-service.log 2>&1 &
INVENTORY_PID=$!
deactivate # Desativa o venv após iniciar (o & garante que ele rode em background mesmo assim)
cd ..

# --- 4. Iniciar Frontend (Next.js) ---
echo "Iniciando o Frontend (Next.js)..."
cd frontend
# Certifique-se de que o venv do Python NÃO está ativo aqui e que o Node está disponível
npm run dev > ../..//frontend.log 2>&1 &
FRONTEND_PID=$!

echo "Todos os serviços foram iniciados em segundo plano."
echo "PIDs (para possível gerenciamento futuro): Directory: $DIRECTORY_PID, Inventory: $INVENTORY_PID, Frontend: $FRONTEND_PID"
echo "Verifique os logs dos serviços ou os terminais para confirmar se iniciaram corretamente."
echo "APIs:"
echo "  - Directory Service (NestJS): http://localhost:3000"
echo "  - Inventory Service (FastAPI): http://127.0.0.1:8000/docs"
echo "  - Frontend (Next.js): http://localhost:3001"
echo "RabbitMQ Management: http://localhost:15672 (user: user, pass: password)"
echo "pgAdmin (se estiver rodando separadamente): http://localhost:5050"
