import json
import statistics
import sys
from pathlib import Path
from typing import Any

import libcst as cst


def discover_py_files(root_dir: Path) -> list[Path]:
    return sorted(
        f for f in root_dir.rglob("*.py")
        if f.is_file() and f.name != "__init__.py"
    )


def module_name_from_path(root_dir: Path, path: Path) -> str:
    rel = path.relative_to(root_dir).with_suffix("")
    return ".".join(rel.parts)


def _extract_module_name(node: cst.BaseExpression) -> str:
    parts = []
    while isinstance(node, cst.Attribute):
        parts.insert(0, node.attr.value)
        node = node.value
    if isinstance(node, cst.Name):
        parts.insert(0, node.value)
    return ".".join(parts)


class FileStatsCollector(cst.CSTVisitor):
    def __init__(self) -> None:
        self.lines = 0
        self.class_count = 0
        self.function_count = 0
        self.method_count = 0
        self.import_count = 0
        self.imported_modules: set[str] = set()

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


def compute_stats(values: list[int], modules: list[str]) -> dict[str, Any]:
    if not values:
        return {"mean": 0.0, "std": 0.0, "min": 0, "max": {"value": 0, "files": []}}
    mean = statistics.mean(values)
    std = statistics.stdev(values) if len(values) > 1 else 0.0
    min_val = min(values)
    max_val = max(values)
    max_files = [mod for mod, val in zip(modules, values) if val == max_val]
    return {
        "mean": mean,
        "std": std,
        "min": min_val,
        "max": {"value": max_val, "files": max_files},
    }


def analyze_project(root_dir: Path, output_dir: Path) -> None:
    py_files = discover_py_files(root_dir)
    modules = [module_name_from_path(root_dir, f) for f in py_files]
    module_map = dict(zip(modules, py_files))

    stats_data = {
        "lines": [],
        "ClassDef": [],
        "FunctionDef": [],
        "MethodDef": [],
        "Import_in": [],
        "Import_out": [],
    }
    imported_modules_by_file: dict[str, set[str]] = {}
    control_counts: list[dict[str, int]] = []

    for path, mod in zip(py_files, modules):
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
        imported_modules_by_file[mod] = visitor.imported_modules
        control_counts.extend(visitor.function_control_counts)

    graph: dict[str, dict[str, list[str]]] = {
        mod: {"depends_from": [], "used_by": []}
        for mod in modules
    }

    for mod, imports in imported_modules_by_file.items():
        deps = [imp for imp in imports if imp in modules]
        graph[mod]["depends_from"] = sorted(deps)

    for mod in modules:
        for dep in graph[mod]["depends_from"]:
            graph[dep]["used_by"].append(mod)

    stats_data["Import_out"] = [len(graph[mod]["used_by"]) for mod in modules]

    final_stats = {
        key: compute_stats(stats_data[key], modules)
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
        module: data["depends_from"]
        for module, data in graph.items()
    }
    (output_dir / "stats.json").write_text(json.dumps(final_stats, indent=2, ensure_ascii=False), encoding="utf-8")
    (output_dir / "graph.json").write_text(json.dumps(import_graph, indent=2, ensure_ascii=False), encoding="utf-8")
