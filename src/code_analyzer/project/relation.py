from dataclasses import dataclass

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
