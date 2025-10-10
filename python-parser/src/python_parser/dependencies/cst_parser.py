import libcst as cst
from easy_kit.timing import time_func
from libcst import MetadataWrapper


class CstParser:
    @time_func
    def get_tree(self, source: bytes):
        tree = cst.parse_module(source)
        return tree
        return MetadataWrapper(tree)


CST_PARSER = CstParser()
