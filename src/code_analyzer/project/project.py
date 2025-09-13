from pathlib import Path

from code_analyzer.project.module_cache import ModuleCache
from code_analyzer.project.relation import Relation
from code_analyzer.scope.config import PYTHON_MODULE_PATTERN

ModuleId = str


class Project:
    def __init__(self, root: Path | str) -> None:
        self.root = Path(root).absolute()
        self.modules: dict[ModuleId, ModuleCache] = {}

    def iter_files(self):
        return set(self.root.rglob(PYTHON_MODULE_PATTERN))

    def iter_modules(self):
        return [_ for _ in self.modules.values()]

    def update(self):
        modules = [
            ModuleCache.from_path(self.root, _)
            for _ in self.iter_files()
        ]
        self.modules = {
            _.ref.ref_id: _
            for _ in modules
        }
        return self

    def hierarchy(self):
        return Relation.hierarchy({_.ref for _ in self.modules.values()})
