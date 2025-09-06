from dataclasses import dataclass
from functools import cache, cached_property
from pathlib import Path

PYTHON_INIT = '__init__'
PYTHON_SUFFIX = '.py'
PYTHON_MODULE_PATTERN = '*.py'
MODULE_SEPARATOR = '.'


@dataclass(frozen=True)
class Module:
    parts: tuple[str, ...]

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
