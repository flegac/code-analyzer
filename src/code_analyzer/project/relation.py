import json
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path

from easy_kit.timing import time_func

from code_analyzer.project.module import Module


@dataclass
class Relation:
    name: str
    graph: dict[str, set[str]]

    def reversed(self):
        nodes = defaultdict(set)
        for a, links in self.graph.items():
            for b in links:
                nodes[b].add(a)
        return Relation(
            name=f'{self.name}-reversed',
            graph=dict(nodes)
        )

    @staticmethod
    @time_func
    def hierarchy(modules: set[Module]):
        data = defaultdict(set)
        for module in modules:
            if module.depth >= 1:
                data[module.parent.full_name].add(module.full_name)

        return Relation(
            name='hierarchy',
            graph=dict(data),
        )

    def to_json(self):
        return {
            k: list(sorted(v))
            for k,v in self.graph.items()
        }


    def dump(self, path: Path):
        full_path = path / f'{self.name}.json'
        with full_path.open('w') as _:
            json.dump(self.to_json(), _, sort_keys=True, indent=4)


    def __repr__(self):
        edges = sum( map(len, self.graph.values()))
        return f'{self.name}(V={len(self.graph)}, E={edges})'
