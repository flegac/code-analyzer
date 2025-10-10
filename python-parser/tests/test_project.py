from pprint import pprint
from unittest import TestCase

from python_parser.project.project import Project
from python_parser.project.project_checker import ProjectChecker


class TestProject(TestCase):
    def test_refresh(self):
        ws = Project('/home/flo/Documents/workspace/code-analyzer/src')

        ws.refresh()
        ProjectChecker(ws).check_all()

        pprint(ws.files)

        # pprint(ws.modules)
        # pprint(ws.hierarchy())
