const Graph = graphology.Graph;

class MyGraph {
    static hierarchy(graph) {
        const hierarchy = new Graph({type: 'directed'});
        graph.graph.forEachNode(full => {
            const [prefix, suffix] = full.split('::');
            const parts = prefix ? prefix.split('.') : [];
            _addPrefixHierarchy(hierarchy, parts);
            _addSuffixHierarchy(hierarchy, parts, suffix);
        });

        const adjacency = {};
        hierarchy.forEachNode(node => {
            adjacency[node] = hierarchy.outNeighbors(node);
        });

        return new MyGraph('hierarchy', adjacency);
    }

    constructor(label, adjacencyList) {
        this.label = label;
        this.graph = new Graph({type: 'directed'});
        for (const [source, targets] of Object.entries(adjacencyList)) {
            if (!this.graph.hasNode(source)) this.graph.addNode(source);
            for (const target of targets) {
                if (!this.graph.hasNode(target)) this.graph.addNode(target);
                this.graph.addEdge(source, target, {label});
            }
        }
    }

    getLinks() {
        return this.graph.edges().map(edge => ({
            source: this.graph.source(edge),
            target: this.graph.target(edge),
            label: this.label
        }));
    }

    getNodes() {
        return this.graph.nodes();
    }

}

function _addPrefixHierarchy(hierarchy, parts) {
    for (let i = 1; i < parts.length; i++) {
        const parent = parts.slice(0, i).join('.');
        const child = parts.slice(0, i + 1).join('.');
        hierarchy.mergeNode(parent);
        hierarchy.mergeNode(child);
        hierarchy.mergeEdge(parent, child);
    }
}

function _addSuffixHierarchy(hierarchy, parts, suffix) {
    if (!suffix) return;

    const [a, b] = suffix.split('/');
    const base = parts.join('.');
    const className = `${base}::${a}`;
    hierarchy.mergeNode(className);
    hierarchy.mergeEdge(base, className);

    if (b) {
        const methodName = `${className}/${b}`;
        hierarchy.mergeNode(methodName);
        hierarchy.mergeEdge(className, methodName);
    }
}