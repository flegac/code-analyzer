import statistics
from dataclasses import dataclass
from typing import Self

from libcst import CSTNode
from tabulate import tabulate


@dataclass
class CodeStats:
    node: CSTNode = None
    lines: int = 0
    classes: int = 0
    functions: int = 0
    methods: int = 0
    loops: int = 0
    branches: int = 0

    def update(self, other: Self, ignore_lines: bool = True):
        if not ignore_lines:
            self.lines += other.lines
        self.classes += other.classes
        self.functions += other.functions
        self.methods += other.methods
        self.loops += other.loops
        self.branches += other.branches

    def to_dict(self):
        return {
            'lines': self.lines,
            'classes': self.classes,
            'functions': self.functions,
            'methods': self.methods,
            'loops': self.loops,
            'branches': self.branches,
        }


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
            class_count=AggregatedStats.aggregate([_.classes for _ in values]),
            function_count=AggregatedStats.aggregate([_.functions for _ in values]),
            method_count=AggregatedStats.aggregate([_.methods for _ in values]),
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
