import datetime
from typing import Optional

import libcst as cst
from libcst.metadata import PositionProvider, ParentNodeProvider, ScopeProvider

from code_analyzer.project.module import Module
from code_analyzer.stats.code_stats import CodeStats
from code_analyzer.stats.stack_context import StackContext


def _extract_module(node: cst.BaseExpression) -> Module:
    parts = []
    while isinstance(node, cst.Attribute):
        parts.insert(0, node.attr.value)
        node = node.value
    if isinstance(node, cst.Name):
        parts.insert(0, node.value)
    return Module.new(tuple(parts))


class ModuleStatsVisitor(cst.CSTVisitor):
    METADATA_DEPENDENCIES = (PositionProvider, ParentNodeProvider, ScopeProvider)

    def __init__(self):
        super().__init__()
        self.stats: CodeStats | None = None
        self.last_update: datetime.datetime | None = None

        self.classes: list[CodeStats] = []
        self.functions: list[CodeStats] = []
        self.imported_modules: set[Module] = set()
        self.stack = StackContext[CodeStats]()

    # ----- Module context ---------------------------------------
    def visit_Module(self, node: cst.Module) -> bool | None:
        assert len(self.stack) == 0
        self._push_node(node)

    def leave_Module(self, node: cst.Module) -> None:
        self.stats = self.stack.pop()
        assert len(self.stack) == 0
        self.last_update = datetime.datetime.now()

    # ----- ClassDef context ---------------------------------------
    def visit_ClassDef(self, node: cst.ClassDef) -> None:
        self.stack.current.classes += 1
        self._push_node(node)

    def leave_ClassDef(self, node: cst.ClassDef) -> None:
        stats = self._pop_update()
        self.classes.append(stats)

    # ----- FunctionDef context ---------------------------------------
    def visit_FunctionDef(self, node: cst.FunctionDef) -> None:
        ctx = self.stack.current
        match ctx.node:
            case cst.ClassDef():
                ctx.methods += 1
            case _:
                ctx.functions += 1

        self._push_node(node)

    def leave_FunctionDef(self, node: cst.FunctionDef) -> None:
        stats = self._pop_update()
        self.functions.append(stats)

    # ----- Imports  ---------------------------------------
    def visit_Import(self, node: cst.Import) -> None:
        self.stack.current.imports += len(node.names)
        for alias in node.names:
            self.imported_modules.add(_extract_module(alias.name))

    def visit_ImportFrom(self, node: cst.ImportFrom) -> None:
        if node.module:
            self.stack.current.imports += 1
            self.imported_modules.add(_extract_module(node.module))

    # ----- Branches  ---------------------------------------
    def visit_If(self, node: cst.If) -> None:
        self.stack.current.branches += 1

    def visit_Else(self, node: cst.Else) -> None:
        self.stack.current.branches += 1

    def visit_Match(self, node: cst.Match) -> None:
        self.stack.current.branches += 1

    def visit_MatchCase(self, node: cst.MatchCase) -> None:
        self.stack.current.branches += 1

    def visit_CompIf(self, node: cst.CompIf) -> Optional[bool]:
        self.stack.current.branches += 1
        return True

    # ----- Loops  ---------------------------------------
    def visit_For(self, node: cst.For) -> None:
        self.stack.current.loops += 1

    def visit_While(self, node: cst.While) -> None:
        self.stack.current.loops += 1

    def visit_ListComp(self, node: cst.ListComp) -> Optional[bool]:
        self.stack.current.loops += 1
        return True

    def visit_SetComp(self, node: cst.SetComp) -> Optional[bool]:
        self.stack.current.loops += 1
        return True

    def visit_DictComp(self, node: cst.DictComp) -> Optional[bool]:
        self.stack.current.loops += 1
        return True

    # ----- utils ---------------------------------------
    def _count_lines(self, node: cst.CSTNode):
        pos = self.get_metadata(PositionProvider, node)
        return pos.end.line - pos.start.line

    def _push_node(self, node: cst.CSTNode):
        self.stack.push(CodeStats(node=node, lines=self._count_lines(node)))

    def _pop_update(self):
        stats = self.stack.pop()
        self.stack.current.update(stats)
        return stats
