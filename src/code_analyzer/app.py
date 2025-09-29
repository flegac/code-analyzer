import json
from pathlib import Path

from easy_kit.timing import setup_timing

from code_analyzer.analyzer import analyze_project
from code_analyzer.dependencies.class_dependency_ts_analyzer import ClassDependencyTsAnalyzer
from code_analyzer.dependencies.dependency_cst_analyzer import DependencyCstAnalyzer
from code_analyzer.dependencies.dependency_ts_analyzer import DependencyTsAnalyzer
from code_analyzer.project.project import Project

setup_timing()


class ModuleStats:

    @staticmethod
    def compute_category(module):
        ref = module.ref.ref_id
        if '::' not in ref:
            return 'Module'
        if '/' not in ref:
            return 'Class'
        return 'Method'

    @staticmethod
    def count_lines(path) -> int:
        with path.open('r', encoding='utf-8') as f:
            return sum(1 for _ in f)


projects = {
    'organism': "/home/flo/Documents/workspace/organism/src",
    'code-analyzer': "/home/flo/Documents/workspace/code-analyzer/src",
}

if __name__ == "__main__":
    name = 'organism'
    project_root = Path(projects[name])
    target = Path(__file__).parent.parent.parent / f'resources/projects/{name}'
    print(f'working in: {target.absolute()}')

    project = Project(name, project_root)
    project.parse()
    g = DependencyTsAnalyzer().analyze(project)
    g.dump(target, 'relation')
    g = ClassDependencyTsAnalyzer().analyze(project)
    g.dump(target, 'classes')

    # ----- STATS ANALYZER ---------------------------------------------
    # analyze_project(project, target)

    node_path = target / 'nodes'
    node_path.mkdir(exist_ok=True, parents=True)
    
    category = {
        _.ref.ref_id : ModuleStats.compute_category(_) 
        for _ in project.iter_modules()
    }
    (node_path / 'category.json').write_text(json.dumps(category, indent=2, sort_keys=True))

    lines = {
        _.ref.ref_id: ModuleStats.count_lines(_.path_from_root(project_root))
        for _ in project.iter_modules()
    }
    (node_path / 'lines.json').write_text(json.dumps(lines, indent=2, sort_keys=True))

