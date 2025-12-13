from logging.config import fileConfig
from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context
import os
import sys
from urllib.parse import quote_plus

# Add the parent directory to the path so we can import our app
backend_dir = os.path.dirname(os.path.dirname(__file__))
sys.path.insert(0, backend_dir)
# Also add the parent of backend (project root) to path
project_root = os.path.dirname(backend_dir)
sys.path.insert(0, project_root)

from app.core.config import settings
from app.core.database import Base
from app.models import *  # Import all models

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Build DATABASE_URL from components to handle special characters in password
# This properly handles passwords with @, :, /, etc.
encoded_password = quote_plus(settings.DB_PASSWORD)
database_url = f"postgresql+psycopg://{settings.DB_USER}:{encoded_password}@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"

# If DATABASE_URL is explicitly provided, use it instead (but still convert to psycopg)
if settings.DATABASE_URL:
    database_url = settings.DATABASE_URL
    # Convert postgresql:// to postgresql+psycopg:// if using psycopg (v3)
    if database_url.startswith("postgresql://") and "psycopg" not in database_url:
        database_url = database_url.replace("postgresql://", "postgresql+psycopg://", 1)

# Store database_url in config attributes to avoid ConfigParser interpolation issues
# ConfigParser treats % as interpolation syntax, so we store it directly in attributes
config.attributes["sqlalchemy.url"] = database_url

# Also set in main option (escape % for ConfigParser)
# ConfigParser requires %% to represent a literal %
escaped_url = database_url.replace("%", "%%")
config.set_main_option("sqlalchemy.url", escaped_url)

# add your model's MetaData object here
# for 'autogenerate' support
target_metadata = Base.metadata

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    # Get URL from attributes first (unescaped), fallback to config option
    url = config.attributes.get("sqlalchemy.url")
    if not url:
        url = config.get_main_option("sqlalchemy.url")
        # Unescape %% back to % if it was escaped
        if url:
            url = url.replace("%%", "%")
    
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    # Get URL from attributes first (unescaped), fallback to config option
    url = config.attributes.get("sqlalchemy.url")
    if not url:
        url = config.get_main_option("sqlalchemy.url")
        # Unescape %% back to % if it was escaped
        if url:
            url = url.replace("%%", "%")
    
    # Create engine directly with the URL to avoid ConfigParser issues
    from sqlalchemy import create_engine
    connectable = create_engine(url, poolclass=pool.NullPool)

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
