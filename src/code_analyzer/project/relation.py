import json
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path

from code_analyzer.scope.module_ref import ModuleRef


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
    def hierarchy(modules: set[ModuleRef]):
        data = defaultdict(set)
        for module in modules:
            if module.depth >= 1:
                data[module.parent.ref_id].add(module.ref_id)

        return Relation(
            name='hierarchy',
            graph=dict(data),
        )

    def to_json(self):
        return {
            k: list(sorted(v))
            for k, v in self.graph.items()
        }

    def dump(self, path: Path):
        full_path = path / f'{self.name}.json'
        with full_path.open('w') as _:
            json.dump(self.to_json(), _, sort_keys=True, indent=4)

    def __repr__(self):
        edges = sum(map(len, self.graph.values()))
        return f'{self.name}(V={len(self.graph)}, E={edges})'
