import tqdm

from code_analyzer.dependencies.ts_parser import PYTHON_PARSER
from code_analyzer.project.module_cache import ModuleCache
from code_analyzer.project.project import Project
from code_analyzer.project.relation import Relation
from code_analyzer.scope.scope_ref import ScopeRef


class ClassDependencyTsAnalyzer:
    name: str = 'class-dependencies[ts]'

    def analyze(self, project: Project):
        scope = ScopeRef()
        for _ in project.iter_modules():
            scope.register_module(_.ref)

        for module in tqdm.tqdm(project.iter_modules(), 'classes'):
            for class_name in self.extract_classes(module):
                scope.register_class(module, class_name)
        for module in tqdm.tqdm(project.iter_modules(), 'methods'):
            for class_name, method_name in self.extract_methods(module):
                scope.register_method(module, class_name, method_name)
        print(scope)


        return scope.class_graph()


    def extract_classes(self, module: ModuleCache):
        module.update(PYTHON_PARSER)
        results = set()

        for match in PYTHON_PARSER.matches(CLASS_DEF_QUERY, module.tree, module.source):
            for class_name in extract_texts(match, 'class_name'):
                results.add(class_name)

        return results

    def extract_methods(self, module: ModuleCache):
        module.update(PYTHON_PARSER)
        results = set()
        for match in PYTHON_PARSER.matches(CLASS_METHOD_DEF_QUERY, module.tree, module.source):
            class_names = extract_texts(match, 'class_name')
            assert len(class_names) == 1
            class_name = class_names[0]

            method_names = extract_texts(match, 'method_name')
            for method_name in method_names:
                results.add((class_name, method_name))
        return results

    def extract_calls(self, module: ModuleCache):
        module.update(PYTHON_PARSER)
        results = []

        for match in PYTHON_PARSER.matches(CALL_QUERY, module.tree, module.source):
            calls = extract_texts(match, 'call')
            assert len(calls) == 1
            call = calls[0]
            args = extract_texts(match, 'arg')
            # results.append((call,args))
            results.append(match)

        return results


def extract_texts(match, key):
    nodes = match.get(key)
    if isinstance(nodes, list):
        return [n.text if hasattr(n, 'text') else str(n) for n in nodes]
    elif hasattr(nodes, 'text'):
        return [nodes.text]
    elif isinstance(nodes, str):
        return [nodes]
    return []


CLASS_DEF_QUERY = """
(class_definition
  name: (identifier) @class_name)
"""

CLASS_METHOD_DEF_QUERY = """
(class_definition
  name: (identifier) @class_name
  body: (block
    (function_definition
      name: (identifier) @method_name)))
"""

CALL_QUERY = """
(call
  function: (identifier) @call
  arguments: (argument_list
    (_) @arg) @args)
"""

USAGE_QUERY = """
(call
  function: (identifier) @usage)

(call
  function: (attribute
              attribute: (identifier) @usage))

(attribute
  attribute: (identifier) @usage)

(expression_statement
  (assignment
    left: (identifier) @variable_name))
  
"""
