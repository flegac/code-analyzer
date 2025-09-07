import sys
from pathlib import Path

from code_analyzer.analyzer import analyze_project
from code_analyzer.project.project import Project

if __name__ == "__main__":
    project_root = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("/home/flo/Documents/workspace/organism/src")
    # project_root = Path("/home/flo/Documents/workspace/code-analyzer/src")
    project = Project(project_root).refresh()

    target = Path.cwd().parent.parent / 'resources/data'
    analyze_project(project, target)
