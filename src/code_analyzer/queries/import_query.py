IMPORT_QUERY = """
(import_statement
  (dotted_name) @module)

(import_statement
  (aliased_import
    name: (dotted_name) @module
    alias: (identifier) @module_alias))

(import_from_statement
  module_name: (dotted_name) @module
  name: (dotted_name) @imported
  )
  
(import_from_statement
  module_name: (dotted_name) @module
  (wildcard_import) @imported)
  
(import_from_statement
  module_name: (relative_import) @relative)
  
(import_from_statement
  module_name: (dotted_name (identifier) @module)
  name: (aliased_import name: (dotted_name (identifier) @imported) alias: (identifier) @imported_alias))  
  
"""
