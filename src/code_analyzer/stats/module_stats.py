from dataclasses import dataclass, field
from typing import Set

from code_analyzer.project.module import Module
from code_analyzer.stats.code_stats import CodeStats


@dataclass
class ModuleStats:
    module: Module
    imported_modules: Set[Module]
    stats: CodeStats = field(default_factory=CodeStats)
