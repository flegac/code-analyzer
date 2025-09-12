from functools import cache
from pathlib import Path

from code_analyzer.project.module import Module
from code_analyzer.project.relation import Relation
from code_analyzer.project.utils import PYTHON_MODULE_PATTERN

ModuleId = str


class Project:
    def __init__(self, root: Path | str) -> None:
        self.root = Path(root).absolute()
        self.modules: set[Module] = set()
        self.files: dict[ModuleId, Path] = {}



    def iter_files(self):
        return list(self.root.rglob(PYTHON_MODULE_PATTERN))

    def update(self):
        self.modules = {
            Module.from_path(self.root, _)
            for _ in self.root.rglob(PYTHON_MODULE_PATTERN)
        }
        self.files = {
            _.full_name: _.path_from_root(self.root)
            for _ in self.modules
        }
        self.hierarchy.cache_clear()
        return self

    @cache
    def hierarchy(self):
        return Relation.hierarchy(self.modules)
