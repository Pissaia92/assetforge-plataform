# Módulos padrão para configuração de logging e caminhos de arquivo
from logging.config import fileConfig

# Componentes do SQLAlchemy para criar a engine e gerenciar o pool de conexões
from sqlalchemy import engine_from_config
from sqlalchemy import pool

# O objeto de contexto principal do Alembic, que gerencia o estado da migração
from alembic import context

# Importa a 'Base' declarativa do arquivo de modelos.
# Isso é crucial para que o Alembic possa detectar as tabelas e colunas
# em código Python.
from models import Base

# O objeto de configuração do Alembic, que fornece acesso programático
# aos valores definidos no arquivo alembic.ini.
config = context.config

# Interpreta o arquivo alembic.ini para configurar o sistema de logging do Python.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Define o target_metadata. Este é o passo mais importante para o autogenerate.
# O Alembic compara este MetaData object (que contém a definição das tabelas
# a partir do models.py) com o estado atual do banco de dados para gerar os scripts
# de migração.
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Executa as migrações em modo 'offline'.

    Este modo configura o contexto apenas com uma URL de banco de dados,
    sem a necessidade de uma Engine. Ele não se conecta ao banco, mas
    gera os scripts SQL que podem ser aplicados manualmente.
    """
    # Obtém a URL do banco de dados a partir do arquivo alembic.ini
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True, # Garante que os valores literais sejam renderizados no script SQL
        dialect_opts={"paramstyle": "named"},
    )

    # Inicia uma transação e executa o processo de migração.
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Executa as migrações em modo 'online'.

    Neste modo, uma Engine do SQLAlchemy é criada e uma conexão
    com o banco de dados é estabelecida para aplicar as migrações diretamente.
    """
    # Cria uma Engine a partir da seção de configuração [alembic] do alembic.ini.
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool, # Evita problemas de concorrência com o pool de conexões.
    )

    # Estabelece uma conexão com o banco de dados.
    with connectable.connect() as connection:
        # Configura o contexto do Alembic com a conexão ativa e o nosso metadata.
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        # Inicia uma transação e executa o processo de migração.
        with context.begin_transaction():
            context.run_migrations()

# Determina se o Alembic está sendo executado em modo offline ou online
# e chama a função correspondente.
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()