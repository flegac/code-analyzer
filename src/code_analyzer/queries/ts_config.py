FUNC_DEF_QUERY = """
(function_definition
    name: (identifier) @name
    parameters: (parameters) @parameters
)
"""
FUNC_CALL_QUERY = """
(call
    function: (identifier) @function
    arguments: (argument_list) @arguments
)
"""
