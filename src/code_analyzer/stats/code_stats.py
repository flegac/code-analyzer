import statistics
from dataclasses import dataclass
from typing import Self

from libcst import CSTNode
from tabulate import tabulate


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

    def update(self, other: Self, ignore_lines: bool = True):
        if not ignore_lines:
            self.lines += other.lines
        self.imports += other.imports
        self.class_count += other.class_count
        self.function_count += other.function_count
        self.method_count += other.method_count
        self.loops += other.loops
        self.branches += other.branches


@dataclass
class AggregatedStats:
    count: int = 0
    total: int = 0
    mean: float = 0
    std: float = 0
    min: int = 0
    max: int = 0

    @staticmethod
    def aggregate(values: list[int]):
        return AggregatedStats(
            count=len(values),
            total=sum(values),
            mean=statistics.mean(values),
            std=statistics.stdev(values),
            min=min(values),
            max=max(values),
        )

    @staticmethod
    def header():
        return ['total', 'mean', 'std', 'min', 'max']

    def to_table(self):
        return [self.total, self.mean, self.std, self.min, self.max]

    def __repr__(self):
        return f'{{ total: {self.total:4}, mean: {self.mean:3.1f}, std: {self.std:2.1f}, range: [{self.min:3},{self.max:3}] }}'


@dataclass
class AggregatedCodeStats:
    count: int
    lines: AggregatedStats
    imports: AggregatedStats
    class_count: AggregatedStats
    function_count: AggregatedStats
    method_count: AggregatedStats
    loops: AggregatedStats
    branches: AggregatedStats

    @staticmethod
    def aggregate(values: list[CodeStats]):
        return AggregatedCodeStats(
            count=len(values),
            lines=AggregatedStats.aggregate([_.lines for _ in values]),
            imports=AggregatedStats.aggregate([_.imports for _ in values]),
            class_count=AggregatedStats.aggregate([_.class_count for _ in values]),
            function_count=AggregatedStats.aggregate([_.function_count for _ in values]),
            method_count=AggregatedStats.aggregate([_.method_count for _ in values]),
            loops=AggregatedStats.aggregate([_.loops for _ in values]),
            branches=AggregatedStats.aggregate([_.branches for _ in values]),
        )

    def to_table(self):
        return [
            [k, *v.to_table()]
            for k, v in self.__dict__.items()
            if k != 'count'
        ]

    def __repr__(self):
        return tabulate(self.to_table(), headers=[f'stat [{self.count} files]', *AggregatedStats.header()])
