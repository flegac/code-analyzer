import re

PYTHON_INIT = '__init__'
PYTHON_SUFFIX = '.py'
PYTHON_FILE_REGEX = re.compile(r'^[a-zA-Z_][a-zA-Z0-9_]*\.py$')
PYTHON_FILE_RGLOB = '*.py'
MODULE_SEPARATOR = '.'
