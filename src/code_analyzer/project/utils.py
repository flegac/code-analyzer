import hashlib

from easy_kit.timing import time_func

PYTHON_INIT = '__init__'
PYTHON_SUFFIX = '.py'
PYTHON_MODULE_PATTERN = '*.py'
MODULE_SEPARATOR = '.'


@time_func
def hash_file(path):
    hasher = hashlib.md5()
    with open(path, 'rb') as f:
        for chunk in iter(lambda: f.read(8192), b''):
            hasher.update(chunk)
    return hasher.hexdigest()
