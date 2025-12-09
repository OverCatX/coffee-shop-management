import logging
import sys
from pythonjsonlogger import jsonlogger
from app.core.config import settings


def setup_logging():
    """Setup structured logging configuration"""
    log_handler = logging.StreamHandler(sys.stdout)
    formatter = jsonlogger.JsonFormatter(
        "%(asctime)s %(name)s %(levelname)s %(message)s"
    )
    log_handler.setFormatter(formatter)

    logger = logging.getLogger()
    logger.addHandler(log_handler)
    logger.setLevel(getattr(logging, settings.LOG_LEVEL.upper()))

    # Set SQLAlchemy logging level
    logging.getLogger("sqlalchemy.engine").setLevel(
        logging.INFO if settings.DEBUG else logging.WARNING
    )

    return logger


logger = setup_logging()

