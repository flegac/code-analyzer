from dataclasses import dataclass
from pathlib import Path

from easy_kit.timing import time_func
from libcst import MetadataWrapper
from tree_sitter import Tree

from python_parser.scope.module_ref import ModuleRef
from python_parser.project.tree_parser import TreeParser
from python_parser.project.utils import hash_file
from python_parser.scope.config import PYTHON_INIT, PYTHON_SUFFIX, MODULE_SEPARATOR


@dataclass
class ModuleCache:
    ref: ModuleRef
    root: Path
    content_id: str | None = None
    source: bytes | None = None
    tree: Tree | MetadataWrapper | None = None

    @staticmethod
    def from_path(root: Path, path: Path):
        return ModuleCache(
            ref=ModuleRef.from_path(root, path),
            root=root
        )

    @time_func
    def update(self, parser: TreeParser):
        path = self.path_from_root(self.root)
        content_id = hash_file(path)
        if content_id != self.content_id:
            self.content_id = content_id
            self.source = path.read_bytes()
            self.tree = parser.get_tree(self.source)

        return self.tree

    def is_update_required(self, root: Path) -> bool:
        path = self.path_from_root(root)
        content_id = hash_file(path)
        return content_id != self.content_id

    def path_from_root(self, root: Path):
        base = root / self.ref.ref_id.replace(MODULE_SEPARATOR, '/')
        default_path = base.with_suffix(PYTHON_SUFFIX)
        if default_path.exists():
            return default_path
        init_path = base / f'{PYTHON_INIT}{PYTHON_SUFFIX}'
        if init_path.exists():
            return init_path
        raise FileNotFoundError(f'neither {base}{PYTHON_SUFFIX} nor {PYTHON_INIT}{PYTHON_SUFFIX} found')
