import sys
from pathlib import Path

from code_analyzer.analyzer import analyze_project

if __name__ == "__main__":
    project_root = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("/home/flo/Documents/workspace/organism/src")
    target = Path.cwd().parent.parent / 'resources'
    analyze_project(project_root, target)
