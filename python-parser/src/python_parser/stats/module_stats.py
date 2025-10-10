from dataclasses import dataclass, field
from typing import Set

from python_parser.scope.module_ref import ModuleRef
from python_parser.stats.code_stats import CodeStats


@dataclass
class ModuleStats:
    module: ModuleRef
    imported_modules: Set[ModuleRef]
    stats: CodeStats = field(default_factory=CodeStats)
