from collections import defaultdict
from pprint import pprint

import tqdm
from easy_kit.timing import time_func
from loguru import logger

from code_analyzer.dependencies.ts_parser import PYTHON_PARSER
from code_analyzer.project.module_cache import ModuleCache
from code_analyzer.project.project import Project
from code_analyzer.project.relation import Relation
from code_analyzer.queries.import_query import PYTHON_IMPORT_QUERY


class DependencyTsAnalyzer:
    name: str = 'dependencies[ts]'

    @time_func
    def analyze(self, project: Project):
        graph = defaultdict(set)
        errors = {}
        for a in tqdm.tqdm(project.iter_modules()):
            report = self.parse(a)
            imported = report['imports']
            if mod_errors := report['errors']:
                errors.update(mod_errors)
            for _ in imported:
                graph[_].update({})
            graph[a.ref.ref_id].update({_ for _ in imported})

        logger.warning(f'ignored imports: {len(errors)}\n\t{errors}')
        return Relation(
            name=f'{self.name}.{project.name}',
            graph=dict(graph),
        )

    def parse(self, module: ModuleCache):
        module.update(PYTHON_PARSER)
        report = {
            'imports': set(),
            'errors': defaultdict(list),
        }
        result = set()
        for parsed in PYTHON_PARSER.matches(PYTHON_IMPORT_QUERY, module.tree, module.source):
            if 'module' not in parsed:
                report['errors'][module.ref].append(parsed)
            else:
                assert len(parsed['module']) == 1
                module_ = parsed['module'][0]
                report['imports'].add(module_)
                for _ in parsed.get('imported', []):
                    report['imports'].add(f'{module_}::{_}')
        return report
