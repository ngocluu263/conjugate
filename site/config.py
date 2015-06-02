import logging

config = {
    'db_engine': 'mysql',
    'db_user': 'root',
    'db_password': '',
    'db_name': 'verbs',
    'db_host': '127.0.0.1',
    'app_host': '127.0.0.1',
    'debug': True,
    'log_file': 'conjugate.log',
    'log_level': logging.DEBUG,
    'log_max_bytes': 10000000,
    'log_backup_count': 5
}