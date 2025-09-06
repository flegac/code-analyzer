from loguru import logger

from code_analyzer.project.project import Project


class ProjectChecker:
    def __init__(self, workspace: Project):
        self.workspace = workspace

    def check_all(self):
        self.check_module_names()

    def check_module_names(self):
        if errors := {
            _
            for _ in self.workspace.modules
            if not _.check()
        }:
            logger.warning(f'wrong identifiers: {errors}')
