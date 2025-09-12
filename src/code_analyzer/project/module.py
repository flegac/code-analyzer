from dataclasses import dataclass
from functools import cache, cached_property
from pathlib import Path

from easy_kit.timing import time_func
from libcst import MetadataWrapper
from tree_sitter import Tree, QueryCursor, Query

from code_analyzer.project.tree_parser import TreeParser
from code_analyzer.project.utils import PYTHON_INIT, PYTHON_SUFFIX, MODULE_SEPARATOR, hash_file


@dataclass
class Module:
    parts: tuple[str, ...]
    content_id: str | None = None
    _source: bytes | None = None
    _tree: Tree | MetadataWrapper | None = None

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
    def update(self, root: Path, parser: TreeParser):
        path = self.path_from_root(root)
        content_id = hash_file(path)
        if content_id != self.content_id:
            self.content_id = content_id
            self._source = path.read_bytes()
            self._tree = parser.get_tree(self._source)

        return self._tree

    def check(self):
        for _ in self.parts:
            if not _.isidentifier():
                return False
            if not _.islower():
                return False
        return True

    def matches(self, query: str):
        query_cursor = QueryCursor(Query(self._tree.language, query))
        for _, match in query_cursor.matches(self._tree.root_node):
            yield {
                pattern: [
                    self._source[node.start_byte:node.end_byte].decode("utf8")
                    for node in nodes
                ]
                for pattern, nodes in match.items()
            }

    def __hash__(self):
        return id(self)

    def __repr__(self):
        return self.full_name
