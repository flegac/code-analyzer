import json
import sys
from pathlib import Path

from easy_kit.timing import setup_timing

from code_analyzer.analyzer import analyze_project
from code_analyzer.dependencies.class_dependency_ts_analyzer import ClassDependencyTsAnalyzer
from code_analyzer.dependencies.dependency_cst_analyzer import DependencyCstAnalyzer
from code_analyzer.dependencies.dependency_ts_analyzer import DependencyTsAnalyzer
from code_analyzer.project.project import Project

setup_timing()


def count_lines(file_path: Path) -> int:
    with file_path.open('r', encoding='utf-8') as f:
        return sum(1 for _ in f)


projects = {
    'organism': "/home/flo/Documents/workspace/organism/src",
    'code-analyzer': "/home/flo/Documents/workspace/code-analyzer/src",
}

if __name__ == "__main__":
    name = 'organism'
    project_root = Path(projects[name])
    target = Path.cwd().parent.parent / f'resources/projects/{name}'

    for analyzer in [
        # DependencyCstAnalyzer(),
        DependencyTsAnalyzer(),
        # ClassDependencyTsAnalyzer()
    ]:
        project = Project(name, project_root)
        project.parse()
        g = analyzer.analyze(project)
        g.dump(target, 'relation')

    # ----- STATS ANALYZER ---------------------------------------------
    # analyze_project(project, target)
    stats = {
        _.ref.ref_id: {'lines': count_lines(_.path_from_root(project_root))}
        for _ in project.iter_modules()
    }
    node_path = target / 'nodes'
    node_path.mkdir(exist_ok=True, parents=True)
    (node_path / 'stats.json').write_text(json.dumps(stats, indent=2))
