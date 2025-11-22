import os
import sys
from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context
from dotenv import load_dotenv

# 1. Add the current directory to Python path so we can import 'models'
sys.path.append(os.getcwd())

# 2. Load Environment Variables (to get DATABASE_URL)
load_dotenv()

# 3. Import your Base and Models
# IMPORTANT: You must import 'models' so the tables are registered!
from models import Base, Product, StockMove, Location 

config = context.config

# 4. Overwrite the SQLAlchemy URL with the one from your .env file
config.set_main_option("sqlalchemy.url", os.environ["DATABASE_URL"])

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# 5. Link the 'target_metadata' to your models
target_metadata = Base.metadata

# ... (Keep the rest of the file below this line standard) ...

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()