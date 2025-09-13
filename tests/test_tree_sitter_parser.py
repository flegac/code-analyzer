import unittest
from pathlib import Path
from pprint import pprint

from code_analyzer.dependencies.ts_parser import TsParser
from code_analyzer.queries.import_query import PYTHON_IMPORT_QUERY


class TreeSitterParserTest(unittest.TestCase):
    def test_imports(self):
        root = Path('/home/flo/Documents/workspace/organism/src')
        path = root / 'organism/game_content/sfx/sfx_library.py'

        parser = TsParser()

        source = path.read_bytes()
        tree = parser.get_tree(source)

        result = list(parser.matches(PYTHON_IMPORT_QUERY, tree, source))
        pprint(result)
        print(parser.dump_tree(tree))

    def test_js_imports(self):
        root = Path('/home/flo/Documents/workspace/code-analyzer/resources/code-editor/src')
        path = Path('/home/flo/Documents/workspace/code-analyzer/resources/code-editor/src/index.ts')

        # TODO: apply to javascript
        # parser = TsParser(tree_sitter_javascript.Language())
        # source = path.read_bytes()
        # tree = parser.get_tree(source)
        # result = list(parser.matches(JS_IMPORT_QUERY, tree, source))
        # pprint(result)
        # print(parser.dump_tree(tree))
