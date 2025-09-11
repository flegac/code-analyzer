from dataclasses import dataclass

import tqdm
from easy_kit.timing import time_func

from code_analyzer.project.link import Link
from code_analyzer.project.project import Project
from code_analyzer.project.relation import Relation
from code_analyzer.dependencies.dependency_visitor import DependencyVisitor


@dataclass
class DependencyAnalyzer:
    project: Project

    @time_func
    def analyze(self):
        nodes = set(self.project.modules)
        links = set()
        for a in tqdm.tqdm(self.project.modules):
            visitor = DependencyVisitor()
            a.get_tree(self.project.root).visit(visitor)
            nodes.update(visitor.imported_modules)
            for b in visitor.imported_modules:
                links.add(Link(a, b))

        return Relation(
            name='dependencies',
            nodes=nodes,
            links=links
        )
