from dataclasses import dataclass
from typing import Self

from libcst import CSTNode


@dataclass
class CodeStats:
    node: CSTNode = None
    lines: int = 0
    imports: int = 0
    class_count: int = 0
    function_count: int = 0
    method_count: int = 0
    loops: int = 0
    branches: int = 0

    def update(self, other: Self):
        # self.lines += other.lines
        self.imports += other.imports
        self.class_count += other.class_count
        self.function_count += other.function_count
        self.method_count += other.method_count
        self.loops += other.loops
        self.branches += other.branches
