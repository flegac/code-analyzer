from dataclasses import dataclass, field

from code_analyzer.project.module import Module
from code_analyzer.stats.module_stats import ModuleStats


@dataclass
class ProjectStats:
    files: list[ModuleStats] = field(default_factory=list)
    import_graph: dict[Module, dict[str, list[Module]]] = field(default_factory=dict)
