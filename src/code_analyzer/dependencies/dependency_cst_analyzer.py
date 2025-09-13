from collections import defaultdict

import libcst as cst
import tqdm
from easy_kit.timing import time_func
from libcst.metadata import PositionProvider, ParentNodeProvider, ScopeProvider

from code_analyzer.dependencies.cst_parser import CST_PARSER
from code_analyzer.project.module_cache import ModuleCache
from code_analyzer.project.project import Project
from code_analyzer.project.relation import Relation


class DependencyCstAnalyzer:
    name:str = 'dependencies[cst]'
    def analyze(self, project: Project):
        graph = defaultdict(set)
        for a in tqdm.tqdm(project.iter_modules()):
            visited = self.parse(a)
            for _ in visited:
                graph[_].update({})
            graph[a.ref.ref_id].update({_ for _ in visited})

        return Relation(
            name=self.name,
            graph=dict(graph),
        )

    @time_func
    def parse(self, module: ModuleCache):
        module.update(CST_PARSER)
        visitor = DependencyVisitor()
        module.tree.visit(visitor)
        return visitor.imported_modules


class DependencyVisitor(cst.CSTVisitor):
    METADATA_DEPENDENCIES = (PositionProvider, ParentNodeProvider, ScopeProvider)

    def __init__(self):
        self.imported_modules: set[str] = set()

    def visit_Import(self, node: cst.Import) -> None:
        for alias in node.names:
            self.imported_modules.add(_extract_name(alias.name))

    def visit_ImportFrom(self, node: cst.ImportFrom) -> None:
        if node.module:
            self.imported_modules.add(_extract_name(node.module))


def _extract_name(node: cst.BaseExpression):
    parts = []
    while isinstance(node, cst.Attribute):
        parts.insert(0, node.attr.value)
        node = node.value
    if isinstance(node, cst.Name):
        parts.insert(0, node.value)
    return ".".join(parts)
