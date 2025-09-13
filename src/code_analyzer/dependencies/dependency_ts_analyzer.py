from collections import defaultdict

import tqdm
from easy_kit.timing import time_func

from code_analyzer.dependencies.ts_parser import PYTHON_PARSER
from code_analyzer.project.module_cache import ModuleCache
from code_analyzer.project.project import Project
from code_analyzer.project.relation import Relation
from code_analyzer.queries.import_query import PYTHON_IMPORT_QUERY


class DependencyTsAnalyzer:
    name: str = 'dependencies[ts]'

    def analyze(self, project: Project):
        graph = defaultdict(set)
        for a in tqdm.tqdm(project.iter_modules()):
            visited = self.parse(a)
            for _ in visited:
                graph[_].update({})
            graph[a.ref.ref_id].update({_ for _ in visited})

        return Relation(
            name=self.name,
            graph=dict(graph),
        )

    @time_func
    def parse(self, module: ModuleCache):
        module.update(PYTHON_PARSER)
        return {
            _
            for item in PYTHON_PARSER.matches(PYTHON_IMPORT_QUERY, module.tree, module.source)
            for _ in item['module']
        }
