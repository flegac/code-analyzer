from collections import defaultdict
from dataclasses import dataclass, field

from code_analyzer.project.module_cache import ModuleCache
from code_analyzer.project.relation import Relation
from code_analyzer.scope.class_ref import ClassId, ClassRef
from code_analyzer.scope.method_ref import MethodId, MethodRef
from code_analyzer.scope.module_ref import ModuleId, ModuleRef


@dataclass
class ScopeRef:
    modules: dict[ModuleId, ModuleRef] = field(default_factory=dict)
    classes: dict[ClassId, ClassRef] = field(default_factory=dict)
    methods: dict[MethodId, MethodRef] = field(default_factory=dict)
    graph: dict[ClassId, set[MethodId]] = field(default_factory=lambda: defaultdict(set))

    def register_module(self, module: ModuleRef):
        self.modules[module.ref_id] = module

    def register_class(self, module: ModuleCache, class_name: str):
        item = ClassRef(module=module, identifier=class_name)
        self.classes[item.ref_id] = item
        self.graph[item.ref_id].update({})

    def register_method(self, module: ModuleCache, class_name: str, method_name: str):
        parent = self.classes[ClassRef.ref_string(module, class_name)]
        item = MethodRef(parent=parent, identifier=method_name)
        self.methods[item.ref_id] = item
        self.graph[parent.ref_id].add(item.ref_id)

    def class_graph(self):
        return Relation(
            name='class_graph',
            graph=self.graph
        )

    def __repr__(self):
        return f'ScopeRef(modules={len(self.modules)}, classes={len(self.classes)}, methods={len(self.methods)}'
