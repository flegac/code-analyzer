import json
from collections import defaultdict
from dataclasses import dataclass, field
from pathlib import Path
from pprint import pprint

import libcst as cst
import tqdm
from libcst import MetadataWrapper

from code_analyzer.project.link import Link
from code_analyzer.project.module import Module
from code_analyzer.project.project import Project
from code_analyzer.project.relation import Relation
from code_analyzer.stats.code_stats import AggregatedCodeStats
from code_analyzer.stats.module_stats_visitor import ModuleStatsVisitor


@dataclass
class ProjectAnalyzer:
    project: Project
    modules: dict[str, ModuleStatsVisitor] = field(default_factory=lambda: defaultdict(ModuleStatsVisitor))

    def refresh_all(self):
        for _ in tqdm.tqdm(self.project.modules):
            self.refresh(_)

        for module in self.project.modules:
            self.update_imported(module)

    def refresh(self, module: Module):
        visitor = self.modules[module.full_name]
        code = module.read_code(self.project.root)
        tree = cst.parse_module(code)
        tree_wrapper = MetadataWrapper(tree)
        tree_wrapper.visit(visitor)

    def update_imported(self, module: Module):
        count = 0
        for k, v in self.modules.items():
            if module in v.imported_modules:
                count += 1
        self.modules[module.full_name].stats.imported = count

    def dependencies(self):
        nodes = set(self.project.modules)
        links = set()
        for a, stats in self.modules.items():
            a_mod = Module.new(a)
            nodes.add(a_mod)
            for b in stats.imported_modules:
                nodes.add(b)
                links.add(Link(a_mod, b))

        return Relation(name='dependencies', nodes=nodes, links=links)

    def infos(self):
        return {
            k: v.stats.to_dict()
            for k, v in self.modules.items()
        }

    def aggregate_stats(self):
        return AggregatedCodeStats.aggregate([
            _.stats
            for _ in self.modules.values()
        ])


def analyze_project(project: Project, output_dir: Path) -> None:
    analyzer = ProjectAnalyzer(project)
    analyzer.refresh_all()

    graphs = [
        analyzer.project.hierarchy(),
        analyzer.dependencies()
    ]
    for graph in graphs:
        graph.dump2(output_dir)
        graph.reversed().dump2(output_dir)

    aggregate_stats = analyzer.aggregate_stats()
    pprint(aggregate_stats)

    infos = analyzer.infos()
    (output_dir / 'modules.json').write_text(json.dumps(infos, indent=2))

    # final_stats, import_graph = aggregate_stats(stats)
    # (output_dir / "stats.json").write_text(json.dumps(final_stats, indent=2, ensure_ascii=False), encoding="utf-8")
