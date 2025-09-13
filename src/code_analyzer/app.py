import sys
from pathlib import Path

from easy_kit.timing import setup_timing

from code_analyzer.dependencies.class_dependency_ts_analyzer import ClassDependencyTsAnalyzer
from code_analyzer.dependencies.dependency_cst_analyzer import DependencyCstAnalyzer
from code_analyzer.dependencies.dependency_ts_analyzer import DependencyTsAnalyzer
from code_analyzer.project.project import Project

setup_timing()

if __name__ == "__main__":
    target = Path.cwd().parent.parent / 'resources/data'

    project_root = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("/home/flo/Documents/workspace/organism/src")
    # project_root = Path("/home/flo/Documents/workspace/code-analyzer/src")

    for analyzer in [
        DependencyCstAnalyzer(),
        DependencyTsAnalyzer(),
        ClassDependencyTsAnalyzer()
    ]:
        project = Project(project_root).update()
        hierarchy = project.hierarchy()

        g = analyzer.analyze(project)
        print(hierarchy)
        print(g)
        hierarchy.dump(target)
        g.dump(target)

    # analyze_project(project, target)
