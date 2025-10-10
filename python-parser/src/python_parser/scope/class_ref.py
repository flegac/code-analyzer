from dataclasses import dataclass
from functools import cached_property

from python_parser.project.module_cache import ModuleCache

ClassId = str


@dataclass
class ClassRef:
    module: ModuleCache
    identifier: str

    @staticmethod
    def ref_string(module: ModuleCache, identifier: str) -> ClassId:
        return f'{module.ref.ref_id}::{identifier}'

    @cached_property
    def ref_id(self):
        return ClassRef.ref_string(self.module, self.identifier)
