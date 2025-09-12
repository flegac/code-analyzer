import sexpdata
import tree_sitter_python
from easy_kit.timing import time_func
from tree_sitter import Language, Parser, Tree, QueryCursor, Query


class TsParser:
    def __init__(self, language: Language = None):
        if language is None:
            language = Language(tree_sitter_python.language())
        self.language = language
        self.parser = Parser(language)

    @time_func
    def get_tree(self, data: bytes):
        def read_callable_byte_offset(byte_offset, point):
            return data[byte_offset: byte_offset + 1]

        tree = self.parser.parse(read_callable_byte_offset, encoding="utf8")
        return tree

    def dump_tree(self, tree: Tree):
        raw = str(tree.root_node)
        parsed = sexpdata.loads(raw)
        return s_format(parsed)

    def matches(self, query: str, tree: Tree, source: bytes):
        query_cursor = QueryCursor(Query(tree.language, query))
        for _, match in query_cursor.matches(tree.root_node):
            yield {
                pattern: [
                    source[node.start_byte:node.end_byte].decode("utf8")
                    for node in nodes
                ]
                for pattern, nodes in match.items()
            }


def s_format(items, indent=1):
    decal = '\t' * indent
    if not isinstance(items, list):
        return f'{items}'
    lines = [s_format(_, indent + 1) for _ in items]
    return '(' + f'\n{decal}'.join(lines) + ')'
