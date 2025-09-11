import json
from dataclasses import dataclass
from pathlib import Path

from easy_kit.timing import time_func

from code_analyzer.project.link import Link
from code_analyzer.project.module import Module


@dataclass
class Relation:
    name: str
    nodes: set[Module]
    links: set[Link]

    def reversed(self):
        return Relation(
            name=f'{self.name}-reversed',
            nodes=set(self.nodes),
            links={_.reversed() for _ in self.links}
        )

    @staticmethod
    @time_func
    def hierarchy(modules: set[Module]):
        return Relation(
            name='hierarchy',
            nodes=modules,
            links={
                Link.new(_.parent, _)
                for _ in modules
                if _.depth >= 1
            }
        )

    def to_json1(self):
        return {
            'nodes': [n.full_name for n in self.nodes],
            'links': [(a.full_name, b.full_name) for (a, b) in self.links]
        }

    def to_json2(self):
        res = {
            k.full_name: set()
            for k in self.nodes
        }
        for a, b in self.links:
            res[a.full_name].add(b.full_name)

        return {
            k: list(sorted(v))
            for k, v in res.items()
        }

    def dump(self, path: Path):
        full_path = path / f'{self.name}.json'
        with full_path.open('w') as _:
            json.dump(self.to_json1(), _, sort_keys=True, indent=4)

    def dump2(self, path: Path):
        full_path = path / f'{self.name}.json'
        with full_path.open('w') as _:
            json.dump(self.to_json2(), _, sort_keys=True, indent=4)
