from functools import cache
from pathlib import Path

from code_analyzer.project.module import PYTHON_MODULE_PATTERN, Module
from code_analyzer.project.relation import Relation


class Project:
    def __init__(self, root: Path | str) -> None:
        self.root = Path(root).absolute()
        self.modules: set[Module] = set()
        self.files: dict[str, Path] = {}

    def refresh(self, path: Path = None):
        if path is None:
            path = self.root
        if not path.is_relative_to(self.root):
            raise ValueError(f'path {path} does not belong to workspace {self.root}')
        self.modules = {
            Module.from_path(self.root, _)
            for _ in path.rglob(PYTHON_MODULE_PATTERN)
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
