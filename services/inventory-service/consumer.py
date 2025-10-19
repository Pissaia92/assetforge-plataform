import asyncio
import json
import logging
from typing import Dict, Any
from sqlalchemy.orm import Session
import aio_pika
from database import SessionLocal # Importa a sessão do banco de dados
import crud, models, schemas # Importa suas funções de CRUD e modelos

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def consume_checkout_events():
    connection = None
    channel = None
    try:
        connection = await aio_pika.connect_robust("amqp://user:password@localhost:5672/")
        channel = await connection.channel()

        # Declarar a exchange (tipo direct)
        exchange = await channel.declare_exchange("asset_events", aio_pika.ExchangeType.DIRECT, durable=True) # Use durable=True se quiser persistência

        # Declarar a fila
        queue = await channel.declare_queue("asset_checkout_queue", durable=True)

        # Vincular a fila à exchange com a routing key específica
        await queue.bind(exchange, routing_key="asset.checked.out")

        async def on_message(message: aio_pika.IncomingMessage):
            async with message.process():
                db = SessionLocal()
                try:
                    await process_checkout_message(message.body, db)
                finally:
                    db.close()

        await queue.consume(on_message)
        logger.info("Consumidor conectado e aguardando mensagens na fila 'asset_checkout_queue' com binding 'asset.checked.out'...")

        await asyncio.Future()

    except Exception as e:
        logger.error(f"Erro no consumidor: {e}")
    finally:
        if connection:
            await connection.close()

# Função para processar a mensagem recebida
async def process_checkout_message(body: bytes, db_session: Session):
    """
    Processa a mensagem de checkout recebida do RabbitMQ.
    """
    try:
        # Desserializa o corpo da mensagem (espera-se JSON)
        message_data: Dict[str, Any] = json.loads(body)
        logger.info(f"Mensagem de checkout recebida: {message_data}")

        asset_id = message_data.get("assetId")
        employee_id = message_data.get("employeeId")
        timestamp = message_data.get("timestamp")

        if not asset_id or not employee_id:
            logger.error(f"Dados insuficientes na mensagem: {message_data}")
            return # Sai se os dados forem inválidos

        # Atualiza o status do ativo no banco de dados
        updated_asset = crud.update_asset_status_and_assignee(db_session, asset_id, "in_use", employee_id)

        if updated_asset:
            logger.info(f"Ativo {asset_id} atualizado para 'in_use' e atribuído ao funcionário {employee_id}.")
        else:
            logger.warning(f"Ativo {asset_id} não encontrado para atualização.")

    except json.JSONDecodeError as e:
        logger.error(f"Erro ao decodificar JSON da mensagem: {e}")
    except Exception as e:
        logger.error(f"Erro ao processar mensagem de checkout: {e}")

# Função principal do consumidor
async def consume_checkout_events():
    """
    Conecta ao RabbitMQ e começa a consumir mensagens da fila asset_checkout_queue.
    """
    connection = None
    channel = None
    try:
        # Conecta ao RabbitMQ
        connection = await aio_pika.connect_robust("amqp://user:password@localhost:5672/")
        channel = await connection.channel()

        # Declarar a fila
        queue = await channel.declare_queue("asset_checkout_queue", durable=True) # Use durable=True se quiser persistência

        # Função de callback para quando uma mensagem chega
        async def on_message(message: aio_pika.IncomingMessage):
            async with message.process(): # Confirma automaticamente após processamento bem-sucedido
                # Cria uma nova sessão do banco de dados para esta mensagem
                db = SessionLocal()
                try:
                    await process_checkout_message(message.body, db)
                finally:
                    db.close() # Fecha a sessão após o processamento

        # Consume mensagens da fila
        await queue.consume(on_message)
        logger.info("Consumidor conectado e aguardando mensagens na fila 'asset_checkout_queue'...")

        # Mantém o consumidor rodando
        await asyncio.Future() # Roda indefinidamente

    except Exception as e:
        logger.error(f"Erro no consumidor: {e}")
    finally:
        if connection:
            await connection.close()

if __name__ == "__main__":
    # Este bloco permite rodar o consumidor isoladamente se necessário
    # asyncio.run(consume_checkout_events())
    pass #