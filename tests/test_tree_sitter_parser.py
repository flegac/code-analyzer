import unittest
from pathlib import Path
from pprint import pprint

from code_analyzer.queries.import_query import IMPORT_QUERY
from code_analyzer.dependencies.ts_parser import TsParser
from code_analyzer.scope.module_ref import ModuleRef


class TreeSitterParserTest(unittest.TestCase):
    def test_imports(self):
        root = Path('/home/flo/Documents/workspace/organism/src')
        path = root / 'organism/game_content/sfx/sfx_library.py'

        parser = TsParser()
        module = ModuleRef.from_path(root, path)
        module.update(root, parser)
        result = list(parser.matches(IMPORT_QUERY, module._tree, module._source))
        pprint(result)
        print(parser.dump_tree(module._tree))
