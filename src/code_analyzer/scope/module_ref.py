from dataclasses import dataclass
from functools import cache, cached_property
from pathlib import Path

from code_analyzer.scope.config import PYTHON_INIT, MODULE_SEPARATOR

ModuleId = str


@dataclass
class ModuleRef:
    parts: tuple[str, ...]

    @staticmethod
    @cache
    def new(parts: str | tuple[str, ...]):
        if isinstance(parts, str):
            parts = parts.split(MODULE_SEPARATOR)
        return ModuleRef(parts)

    @staticmethod
    def ref_string(parts: tuple[str, ...]) -> ModuleId:
        return MODULE_SEPARATOR.join(parts)

    @staticmethod
    def from_path(root: Path, path: Path):
        parts = path.relative_to(root).with_suffix('').parts
        if parts[-1] == PYTHON_INIT:
            parts = parts[:-1]
        return ModuleRef.new(parts)

    @staticmethod
    def free_memory():
        ModuleRef.new.cache_clear()

    @property
    def depth(self):
        return len(self.parts) - 1

    @property
    def name(self):
        return self.parts[-1]

    @cached_property
    def ref_id(self):
        return self.ref_string(self.parts)

    @property
    def parent(self):
        return ModuleRef.new(self.parts[:-1])

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
        return self.ref_id
