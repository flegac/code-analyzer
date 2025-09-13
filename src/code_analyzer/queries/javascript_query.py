JS_IMPORT_QUERY = """
; import defaultExport from 'module-name';
(import_statement
  (import_clause
    name: (identifier) @default_import)
  source: (string) @module)

; import * as name from 'module-name';
(import_statement
  (import_clause
    (namespace_import
      name: (identifier) @namespace_alias))
  source: (string) @module)

; import { export1, export2 as alias } from 'module-name';
(import_statement
  (import_clause
    (named_imports
      (import_specifier
        name: (identifier) @imported)
      (import_specifier
        name: (identifier) @imported
        alias: (identifier) @imported_alias)))
  source: (string) @module)

; import 'module-name'; (side-effect only)
(import_statement
  source: (string) @module)

  
"""
