from dataclasses import dataclass, field

from code_analyzer.scope.module_ref import ModuleRef
from code_analyzer.stats.module_stats import ModuleStats


@dataclass
class ProjectStats:
    files: list[ModuleStats] = field(default_factory=list)
    import_graph: dict[ModuleRef, dict[str, list[ModuleRef]]] = field(default_factory=dict)
