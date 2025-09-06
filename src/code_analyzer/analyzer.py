import statistics
from collections import defaultdict
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Iterable

import libcst as cst
import tqdm
from libcst import MetadataWrapper

from code_analyzer.project.link import Link
from code_analyzer.project.module import Module
from code_analyzer.project.project import Project
from code_analyzer.project.relation import Relation
from code_analyzer.stats.module_stats_visitor import ModuleStatsVisitor
from code_analyzer.stats.project_stats import ProjectStats


# 📥 Extraction des stats fichier par fichier


@dataclass
class ProjectAnalyzer:
    project: Project
    modules: dict[str, ModuleStatsVisitor] = field(default_factory=lambda: defaultdict(ModuleStatsVisitor))

    def refresh_all(self):
        for _ in tqdm.tqdm(self.project.modules):
            self.refresh(_)

    def refresh(self, module: Module):
        visitor = self.modules[module.full_name]
        code = module.read_code(self.project.root)
        tree = cst.parse_module(code)
        tree_wrapper = MetadataWrapper(tree)
        tree_wrapper.visit(visitor)

    def dependencies(self):
        return Relation(
            name='dependencies',
            nodes=self.project.modules,
            links={
                Link.new(a, b)
                for a in self.project.modules
                for b in self.modules[a.full_name].imported_modules
            }
        )


# 📊 Agrégation des statistiques

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


def aggregate_stats(stats: ProjectStats) -> tuple[dict[str, Any], dict[str, list[str]]]:
    def collect(key: str) -> list[int]:
        return [getattr(fs, key) for fs in stats.files]

    def collect_control(kind: str) -> list[int]:
        return [ctrl[kind] for fs in stats.files for ctrl in fs.control_counts]

    modules = [fs.module for fs in stats.files]
    final_stats = {
        key: compute_stats(collect(key), modules)
        for key in ["lines", "class_count", "function_count", "method_count", "import_count"]
    }

    final_stats["function_count"]["control_structures"] = {
        kind: {
            "mean": statistics.mean(collect_control(kind)) if stats.files else 0.0,
            "max": max(collect_control(kind)) if stats.files else 0,
        }
        for kind in ("If", "For", "While")
    }

    final_stats["import_out"] = compute_stats(
        [len(stats.import_graph[fs.module]["used_by"]) for fs in stats.files],
        modules
    )

    import_graph = {
        mod.full_name: [dep.full_name for dep in data["depends_from"]]
        for mod, data in stats.import_graph.items()
    }

    return final_stats, import_graph


def analyze_project(project: Project, output_dir: Path) -> None:
    analyzer = ProjectAnalyzer(project)
    analyzer.refresh_all()

    hierarchy = analyzer.project.hierarchy()
    dependencies = analyzer.dependencies()
    hierarchy.dump2(output_dir / 'hierarchy.json')
    dependencies.dump2(output_dir / 'dependencies.json')

    # final_stats, import_graph = aggregate_stats(stats)
    # (output_dir / "stats.json").write_text(json.dumps(final_stats, indent=2, ensure_ascii=False), encoding="utf-8")
