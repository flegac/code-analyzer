import json
from dataclasses import dataclass
from pathlib import Path

from code_analyzer.project.link import Link
from code_analyzer.project.module import Module


@dataclass
class Relation:
    name: str
    nodes: set[Module]
    links: set[Link]

    @staticmethod
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

    def dump(self, path: Path):
        with path.open('w') as _:
            json.dump({
                'nodes': [n.full_name for n in self.nodes],
                'links': [(a.full_name, b.full_name) for (a, b) in self.links]
            }, _, sort_keys=True, indent=4)

    def dump2(self, path: Path):
        res = {
            k.full_name: set()
            for k in self.nodes
        }
        for a, b in self.links:
            res[a.full_name].add(b.full_name)

        res = {
            k: list(v)
            for k, v in res.items()
        }

        with path.open('w') as _:
            json.dump(res, _, sort_keys=True, indent=4)
