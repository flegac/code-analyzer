import json
from collections import defaultdict
from dataclasses import dataclass, field
from pathlib import Path
from pprint import pprint

import tqdm
from easy_kit.timing import time_func

from code_analyzer.dependencies.dependency_cst_analyzer import DependencyCstAnalyzer
from code_analyzer.project.project import Project
from code_analyzer.scope.module_ref import ModuleRef
from code_analyzer.stats.code_stats import AggregatedCodeStats
from code_analyzer.stats.module_stats_visitor import ModuleStatsVisitor


@dataclass
class ProjectAnalyzer:
    project: Project
    modules: dict[str, ModuleStatsVisitor] = field(default_factory=lambda: defaultdict(ModuleStatsVisitor))

    @time_func
    def refresh_all(self):
        for _ in tqdm.tqdm(self.project.modules):
            self.refresh(_)

        for module in self.project.modules:
            self.update_imported(module)

    @time_func
    def refresh(self, module: ModuleRef):
        visitor = self.modules[module.ref_id]
        module.get_tree(self.project.root).visit(visitor)

    def update_imported(self, module: ModuleRef):
        count = 0
        for k, v in self.modules.items():
            if module in v.imported_modules:
                count += 1
        self.modules[module.ref_id].stats.imported = count

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


@time_func
def analyze_project(project: Project, output_dir: Path) -> None:
    node_path = output_dir / 'nodes'
    node_path.mkdir(exist_ok=True, parents=True)

    analyzer = ProjectAnalyzer(project)
    analyzer.refresh_all()

    graphs = [
        analyzer.project.hierarchy(),
        DependencyCstAnalyzer().analyze(project)
    ]
    for graph in graphs:
        graph.dump(output_dir)

    aggregate_stats = analyzer.aggregate_stats()
    pprint(aggregate_stats)

    infos = analyzer.infos()
    (node_path / 'stats.json').write_text(json.dumps(infos, indent=2))

    # final_stats, import_graph = aggregate_stats(stats)
    # (output_dir / "stats.json").write_text(json.dumps(final_stats, indent=2, ensure_ascii=False), encoding="utf-8")
