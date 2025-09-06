import json
import statistics
import sys
from pathlib import Path
from typing import Any, Iterable

import libcst as cst

from code_analyzer.project.module import Module
from code_analyzer.project.project import Project


def _extract_module_name(node: cst.BaseExpression) -> Module:
    parts = []
    while isinstance(node, cst.Attribute):
        parts.insert(0, node.attr.value)
        node = node.value
    if isinstance(node, cst.Name):
        parts.insert(0, node.value)

    return Module.new(tuple(parts))


class FileStatsCollector(cst.CSTVisitor):
    def __init__(self):
        self.lines = 0
        self.class_count = 0
        self.function_count = 0
        self.method_count = 0
        self.import_count = 0
        self.imported_modules: set[Module] = set()

        self._in_class = 0
        self._in_function = False
        self._current_ctrl_counts: dict[str, int] = {}
        self.function_control_counts: list[dict[str, int]] = []

    def visit_Import(self, node: cst.Import) -> None:
        self.import_count += 1
        for alias in node.names:
            self.imported_modules.add(_extract_module_name(alias.name))

    def visit_ImportFrom(self, node: cst.ImportFrom) -> None:
        self.import_count += 1
        if node.module:
            self.imported_modules.add(_extract_module_name(node.module))

    def visit_ClassDef(self, node: cst.ClassDef) -> None:
        self.class_count += 1
        self._in_class += 1

    def leave_ClassDef(self, node: cst.ClassDef) -> None:
        self._in_class -= 1

    def visit_FunctionDef(self, node: cst.FunctionDef) -> None:
        if self._in_class > 0:
            self.method_count += 1
        else:
            self.function_count += 1
        self._in_function = True
        self._current_ctrl_counts = {"If": 0, "For": 0, "While": 0}

    def leave_FunctionDef(self, node: cst.FunctionDef) -> None:
        self.function_control_counts.append(self._current_ctrl_counts)
        self._in_function = False

    def visit_If(self, node: cst.If) -> None:
        if self._in_function:
            self._current_ctrl_counts["If"] += 1

    def visit_For(self, node: cst.For) -> None:
        if self._in_function:
            self._current_ctrl_counts["For"] += 1

    def visit_While(self, node: cst.While) -> None:
        if self._in_function:
            self._current_ctrl_counts["While"] += 1


def compute_stats(values: list[int], modules: Iterable[Module]) -> dict[str, Any]:
    if not values:
        return {"mean": 0.0, "std": 0.0, "min": 0, "max": {"value": 0, "files": []}}
    mean = statistics.mean(values)
    std = statistics.stdev(values) if len(values) > 1 else 0.0
    min_val = min(values)
    max_val = max(values)
    max_files = [mod.full_name for mod, val in zip(modules, values) if val == max_val]
    return {
        "mean": mean,
        "std": std,
        "min": min_val,
        "max": {"value": max_val, "files": max_files},
    }


def analyze_project(project: Project, output_dir: Path) -> None:
    stats_data = {
        "lines": [],
        "ClassDef": [],
        "FunctionDef": [],
        "MethodDef": [],
        "Import_in": [],
        "Import_out": [],
    }
    import_by_module: dict[Module, set[Module]] = {}
    control_counts: list[dict[str, int]] = []

    for mod in project.modules:
        path = mod.path_from_root(project.root)
        try:
            code = path.read_text(encoding="utf-8")
            tree = cst.parse_module(code)
            visitor = FileStatsCollector()
            visitor.lines = code.count("\n") + 1
            tree.visit(visitor)
        except Exception as e:
            print(f"Erreur dans {path}: {e}", file=sys.stderr)
            continue

        stats_data["lines"].append(visitor.lines)
        stats_data["ClassDef"].append(visitor.class_count)
        stats_data["FunctionDef"].append(visitor.function_count)
        stats_data["MethodDef"].append(visitor.method_count)
        stats_data["Import_in"].append(visitor.import_count)
        import_by_module[mod] = visitor.imported_modules
        control_counts.extend(visitor.function_control_counts)

    graph: dict[Module, dict[str, list[Module]]] = {
        mod: {"depends_from": [], "used_by": []}
        for mod in project.modules
    }

    for mod, imports in import_by_module.items():
        deps = [imp for imp in imports if imp in project.modules]
        graph[mod]["depends_from"] = deps

    for mod in project.modules:
        for dep in graph[mod]["depends_from"]:
            graph[dep]["used_by"].append(mod)

    stats_data["Import_out"] = [len(graph[mod]["used_by"]) for mod in project.modules]

    final_stats = {
        key: compute_stats(stats_data[key], project.modules)
        for key in ["lines", "ClassDef", "FunctionDef", "MethodDef", "Import_in", "Import_out"]
    }

    final_stats["FunctionDef"]["control_structures"] = {
        kind: {
            "mean": statistics.mean([ctrl[kind] for ctrl in control_counts]) if control_counts else 0.0,
            "max": max([ctrl[kind] for ctrl in control_counts]) if control_counts else 0,
        }
        for kind in ("If", "For", "While")
    }

    import_graph = {
        module.full_name: [_.full_name for _ in data["depends_from"]]
        for module, data in graph.items()
    }
    (output_dir / "stats.json").write_text(json.dumps(final_stats, indent=2, ensure_ascii=False), encoding="utf-8")
    (output_dir / "graph.json").write_text(json.dumps(import_graph, indent=2, ensure_ascii=False), encoding="utf-8")
