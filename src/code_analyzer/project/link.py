from functools import cache
from typing import NamedTuple

from code_analyzer.project.module import Module


class Link(NamedTuple):
    src: Module
    dest: Module

    @staticmethod
    @cache
    def new(src: Module, dest: Module):
        return Link(src, dest)

    @staticmethod
    def free_memory():
        Link.new.cache_clear()

    def reversed(self):
        return Link.new(self.dest, self.src)

    def __hash__(self):
        return id(self)

    def __repr__(self):
        return f'({self.src},{self.dest})'
