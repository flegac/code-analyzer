from dataclasses import dataclass, field
from typing import Set

from code_analyzer.scope.module_ref import ModuleRef
from code_analyzer.stats.code_stats import CodeStats


@dataclass
class ModuleStats:
    module: ModuleRef
    imported_modules: Set[ModuleRef]
    stats: CodeStats = field(default_factory=CodeStats)
