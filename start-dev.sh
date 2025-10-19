# Script para iniciar todo o ambiente de desenvolvimento do AssetForge

echo "🚀 Iniciando ambiente de desenvolvimento AssetForge..."

# Define a pasta raiz do projeto para facilitar a navegação
PROJECT_ROOT="/d/GitProjects/assetforge-plataform"

# --- ETAPA 1: SERVIÇOS DE BASE (DOCKER) ---
echo "Iniciando serviços de base (RabbitMQ)..."
cd "$PROJECT_ROOT"
docker-compose up -d rabbitmq
echo "RabbitMQ iniciado."
echo "----------------------------------------"

# --- ETAPA 2: ABRIR TERMINAIS DOS SERVIÇOS ---

# O comando 'start git-bash.exe -c "..."' abre um novo terminal Git Bash
# e executa os comandos dentro das aspas.
# O '&& bash' no final é um truque para manter o terminal aberto após o comando rodar.

# Iniciar Backend de Autenticação (NestJS)
echo "Iniciando Directory Service (NestJS)..."
start git-bash.exe -c "echo '--- Directory Service (NestJS) ---'; cd '$PROJECT_ROOT/services/directory-service'; npm run start:dev; exec bash"

# Iniciar Backend de Inventário (Python/FastAPI)
echo "Iniciando Inventory Service (Python)..."
start git-bash.exe -c "echo '--- Inventory Service (Python) ---'; cd '$PROJECT_ROOT/services/inventory-service'; source venv/Scripts/activate; uvicorn main:app --reload; exec bash"

# Iniciar Frontend (Next.js)
echo "Iniciando Frontend (Next.js)..."
start git-bash.exe -c "echo '--- Frontend (Next.js) ---'; cd '$PROJECT_ROOT/frontend'; npm run dev; exec bash"

echo "✅ Ambiente iniciado! Verifique os novos terminais."