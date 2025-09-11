import libcst as cst
from libcst.metadata import PositionProvider, ParentNodeProvider, ScopeProvider

from code_analyzer.project.module import Module


class DependencyVisitor(cst.CSTVisitor):
    METADATA_DEPENDENCIES = (PositionProvider, ParentNodeProvider, ScopeProvider)

    def __init__(self):
        super().__init__()
        self.imported_modules: set[Module] = set()

    # ----- Imports  ---------------------------------------
    def visit_Import(self, node: cst.Import) -> None:
        for alias in node.names:
            self.imported_modules.add(_extract_module(alias.name))

    def visit_ImportFrom(self, node: cst.ImportFrom) -> None:
        if node.module:
            self.imported_modules.add(_extract_module(node.module))


def _extract_module(node: cst.BaseExpression) -> Module:
    parts = []
    while isinstance(node, cst.Attribute):
        parts.insert(0, node.attr.value)
        node = node.value
    if isinstance(node, cst.Name):
        parts.insert(0, node.value)
    return Module.new(tuple(parts))
