from dataclasses import dataclass, field

from python_parser.scope.module_ref import ModuleRef
from python_parser.stats.module_stats import ModuleStats


@dataclass
class ProjectStats:
    files: list[ModuleStats] = field(default_factory=list)
    import_graph: dict[ModuleRef, dict[str, list[ModuleRef]]] = field(default_factory=dict)
