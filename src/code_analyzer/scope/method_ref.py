from dataclasses import dataclass
from functools import cached_property

from code_analyzer.scope.class_ref import ClassRef

MethodId = str


@dataclass
class MethodRef:
    parent: ClassRef
    identifier: str

    @staticmethod
    def ref_string(parent: ClassRef, identifier: str) -> MethodId:
        return f'{parent.ref_id}/{identifier}'

    @property
    def module(self):
        return self.parent.module

    @cached_property
    def ref_id(self):
        return MethodRef.ref_string(self.parent, self.identifier)
