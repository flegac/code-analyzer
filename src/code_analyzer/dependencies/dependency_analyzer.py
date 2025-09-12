from collections import defaultdict

import libcst as cst
import tqdm
from easy_kit.timing import time_func
from libcst import MetadataWrapper
from libcst.metadata import PositionProvider, ParentNodeProvider, ScopeProvider

from code_analyzer.project.module import Module
from code_analyzer.project.project import Project
from code_analyzer.project.relation import Relation


class CstParser:
    @time_func
    def get_tree(self, source: bytes):
        tree = cst.parse_module(source)
        return tree
        return MetadataWrapper(tree)


PARSER = CstParser()


class DependencyAnalyzer:
    @time_func
    def analyze(self, project: Project):
        graph = defaultdict(set)
        for a in tqdm.tqdm(project.modules):
            imported = self.parse(project, a)
            for _ in imported:
                graph[_.full_name].update({})
            graph[a.full_name].update({_.full_name for _ in imported})

        return Relation(
            name='dependencies[libCST]',
            graph=dict(graph),
        )

    @time_func
    def parse(self, project: Project, module: Module):
        module.update(project.root, PARSER)
        visitor = DependencyVisitor()
        module._tree.visit(visitor)
        return visitor.imported_modules


class DependencyVisitor(cst.CSTVisitor):
    METADATA_DEPENDENCIES = (PositionProvider, ParentNodeProvider, ScopeProvider)

    def __init__(self):
        super().__init__()
        self.imported_modules: set[Module] = set()

    # ----- Imports  ---------------------------------------
    @time_func
    def visit_Import(self, node: cst.Import) -> None:
        for alias in node.names:
            self.imported_modules.add(_extract_module(alias.name))

    @time_func
    def visit_ImportFrom(self, node: cst.ImportFrom) -> None:
        if node.module:
            self.imported_modules.add(_extract_module(node.module))


@time_func
def _extract_module(node: cst.BaseExpression) -> Module:
    parts = []
    while isinstance(node, cst.Attribute):
        parts.insert(0, node.attr.value)
        node = node.value
    if isinstance(node, cst.Name):
        parts.insert(0, node.value)
    return Module.new(tuple(parts))
