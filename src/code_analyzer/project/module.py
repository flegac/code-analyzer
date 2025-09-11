import hashlib
from dataclasses import dataclass
from functools import cache, cached_property
from pathlib import Path

import libcst as cst
from easy_kit.timing import time_func
from libcst import MetadataWrapper

PYTHON_INIT = '__init__'
PYTHON_SUFFIX = '.py'
PYTHON_MODULE_PATTERN = '*.py'
MODULE_SEPARATOR = '.'


@dataclass
class Module:
    parts: tuple[str, ...]
    content_id: str | None = None
    _code: str | None = None
    _tree: MetadataWrapper | None = None

    @staticmethod
    def from_path(root: Path, path: Path):
        parts = path.relative_to(root).with_suffix('').parts
        if parts[-1] == PYTHON_INIT:
            parts = parts[:-1]
        return Module.new(parts)

    @staticmethod
    @cache
    def new(parts: str | tuple[str, ...]):
        if isinstance(parts, str):
            parts = parts.split(MODULE_SEPARATOR)
        return Module(parts)

    @staticmethod
    def free_memory():
        Module.new.cache_clear()

    @property
    def depth(self):
        return len(self.parts) - 1

    @property
    def name(self):
        return self.parts[-1]

    @cached_property
    def full_name(self):
        return MODULE_SEPARATOR.join(self.parts)

    @property
    def parent(self):
        return Module.new(self.parts[:-1])

    def path_from_root(self, root: Path):
        base = root / self.full_name.replace(MODULE_SEPARATOR, '/')
        default_path = base.with_suffix(PYTHON_SUFFIX)
        if default_path.exists():
            return default_path
        init_path = base / f'{PYTHON_INIT}{PYTHON_SUFFIX}'
        if init_path.exists():
            return init_path
        raise FileNotFoundError(f'neither {base}{PYTHON_SUFFIX} nor {PYTHON_INIT}{PYTHON_SUFFIX} found')

    def is_update_required(self, root: Path) -> bool:
        path = self.path_from_root(root)
        content_id = hash_file(path)
        return content_id != self.content_id

    @time_func
    def get_tree(self, root: Path):
        path = self.path_from_root(root)
        content_id = hash_file(path)
        if content_id != self.content_id:
            self.content_id = content_id
            self._code = path.read_text(encoding="utf-8")
            tree = cst.parse_module(self._code)
            wrapper = MetadataWrapper(tree)
            self._tree = wrapper
        return self._tree

    def check(self):
        for _ in self.parts:
            if not _.isidentifier():
                return False
            if not _.islower():
                return False
        return True

    def __hash__(self):
        return id(self)

    def __repr__(self):
        return self.full_name


@time_func
def hash_file(path):
    hasher = hashlib.md5()
    with open(path, 'rb') as f:
        for chunk in iter(lambda: f.read(8192), b''):
            hasher.update(chunk)
    return hasher.hexdigest()
