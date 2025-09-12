from collections import defaultdict

import tqdm
from easy_kit.timing import time_func

from code_analyzer.queries.import_query import IMPORT_QUERY
from code_analyzer.dependencies.ts_parser import TsParser
from code_analyzer.project.module import Module
from code_analyzer.project.project import Project
from code_analyzer.project.relation import Relation

PARSER = TsParser()


class DependencyTsAnalyzer:
    @time_func
    def analyze(self, project: Project):
        graph = defaultdict(set)
        for a in tqdm.tqdm(project.modules):
            visited = self.parse(project, a)
            for _ in visited:
                graph[a.full_name].add(_)
                graph[_].update({})
            graph[a.full_name].update(visited)

        return Relation(
            name='dependencies[ts]',
            graph=graph,
        )

    def parse(self, project: Project, module: Module):
        module.update(project.root, PARSER)
        return {
            _
            for item in PARSER.matches(IMPORT_QUERY, module._tree, module._source)
            for _ in item['module']
        }
