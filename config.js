require('dotenv').config();

CONFIG = {};

CONFIG.db_dialect = process.env.DB_DIALECT;
CONFIG.db_host = process.env.DB_HOST;
CONFIG.db_port = process.env.DB_PORT;
CONFIG.db_name = process.env.DB_NAME;
CONFIG.db_user = process.env.DB_USER;
CONFIG.db_password = process.env.DB_PASSWORD;
CONFIG.TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
CONFIG.TELEGRAM_USER_ID = process.env.TELEGRAM_USER_ID;
CONFIG.SALT = process.env.SALT;
CONFIG.JWT_SECRET = process.env.JWT_SECRET;