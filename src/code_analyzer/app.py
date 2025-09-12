import sys
from pathlib import Path

from easy_kit.timing import setup_timing

from code_analyzer.dependencies.dependency_analyzer import DependencyAnalyzer
from code_analyzer.dependencies.ts_dependency_analyzer import DependencyTsAnalyzer
from code_analyzer.project.project import Project

setup_timing()

if __name__ == "__main__":
    target = Path.cwd().parent.parent / 'resources/data'

    project_root = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("/home/flo/Documents/workspace/organism/src")
    # project_root = Path("/home/flo/Documents/workspace/code-analyzer/src")
    project = Project(project_root).update()
    # g = DependencyTsAnalyzer().analyze(project)
    g = DependencyAnalyzer().analyze(project)
    hierarchy = project.hierarchy()

    print(hierarchy)
    print(g)
    hierarchy.dump(target)
    g.dump(target)

    # analyze_project(project, target)
