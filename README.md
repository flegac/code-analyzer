# Code Graph vizualisation

## Usage

1) Create a new project in `resources/projects/<my-project>/`

- `<my-project>/relation.json`: the relation to explore (i.e. some dependency graph)
- `<my-project>/config.json`: filtering configuration (nodes to include/exclude)
- `<my-project>/nodes/stats.json`: attach metadata to nodes
- `<my-project>/nodes/<metadata>.json`: (wip) attach multiple metadata to nodes
- `<my-project>/links/<metadata>.json`: (unavailable) attach metadata to links too (?)


2) Open the viewer (requires a simple server to allow fetching files on disk)

- [viewer](./resources/code-viz.html)


## Relation/Graph definition

A relation (graph) is defined by a file (json) containing an adjacency list for each node:

```json
{
  "a": [
    "b",
    "a.x"
  ],
  "b": []
}
```

## Configuration / Graph Filtering

A configuration file (json) allows to filter nodes in a a graph *before* it gets displayed or even analysed.

```json
{
  "selected": [
    "@xxx",
    "my.core.package.*"
  ],
  "excluded": [
    "@stdlib",
    "my.utils.package.*"
  ],
  "groups": {
    "stdlib": [
      "typing",
      "dataclasses"
    ],
    "xxx": [],
    "yyy": []
  }
}
```

The following are mandatory:

- `groups`: used to define sets of modules,
- `selected`: a sets of modules to keep (everything is selected by default - if empty),
- `excluded`: a sets of modules to remove (overrides `selected` modules).


Each group defined in `groups` section or in `selected` / `excluded` must be one of :

- 'a.b.c' : exact match
- 'a.b.*' : prefix match
- '*.b.c': suffix match
- '@groupId': replaced by the group defined in the `groups` section.

- **Advanced usage:**

Using `@<ref>` notation allows to includes another set (if `<ref>` is defined in the `groups` section).