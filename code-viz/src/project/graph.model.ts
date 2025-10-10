

import Graph from "graphology";

export interface MyNode {
    id: string;
    x: number;
    y: number;
    z: number;
    fx?: number | null;
    fy?: number | null;
    fz?: number | null;
    read: (label: string) => any;
    readAll: () => { [k: string]: any };
    write: (label: string, value: any) => void;
};

export interface MyLink {
    source: string | MyNode;
    target: string | MyNode;
    label: string;
};

export interface ForceGraph {
    nodes: string[];
    links: MyLink[];
}

export interface AdjacencyGraph {
    [k: string]: string[];
};

class GraphModel {
    label: string;
    adjacencyList: AdjacencyGraph;
    graph: ForceGraph;
    static hierarchy(graph: GraphModel) {
        const hierarchy = new Graph({ type: 'directed' });
        graph.toGraphology().forEachNode((full: string) => {
            const [prefix, suffix] = full.split('::');
            const parts = prefix ? prefix.split('.') : [];
            _addPrefixHierarchy(hierarchy, parts);
            _addSuffixHierarchy(hierarchy, parts, suffix);
        });

        const adjacency: AdjacencyGraph = {};
        hierarchy.forEachNode((node: string) => {
            adjacency[node] = hierarchy.outNeighbors(node);
        });

        return new GraphModel('hierarchy', adjacency);
    }

    constructor(label: string, graph: AdjacencyGraph) {
        this.label = label;
        this.adjacencyList = graph;
        this.graph = this.toForceGraph()
    }

    links() {
        return this.graph.links;
    }

    nodes() {
        return this.graph.nodes;
    }

    toForceGraph(): ForceGraph {
        const nodesSet = new Set<string>();
        const links = [];

        for (const [source, targets] of Object.entries(this.adjacencyList)) {
            nodesSet.add(source);
            for (const target of targets) {
                nodesSet.add(target);
                links.push({ source, target, label: this.label });
            }
        }

        const nodes = Array.from(nodesSet);
        return {
            nodes,
            links
        };
    }

    toGraphology() {
        const graph = new Graph({ type: 'directed' });
        for (const [source, targets] of Object.entries(this.adjacencyList)) {
            if (!graph.hasNode(source)) graph.addNode(source);
            for (const target of targets) {
                if (!graph.hasNode(target)) graph.addNode(target);
                graph.addEdge(source, target, { label: this.label });
            }
        }
        return graph;
    }
}

function _addPrefixHierarchy(hierarchy: Graph, parts: string[]) {
    for (let i = 1; i < parts.length; i++) {
        const parent = parts.slice(0, i).join('.');
        const child = parts.slice(0, i + 1).join('.');
        hierarchy.mergeNode(parent);
        hierarchy.mergeNode(child);
        hierarchy.mergeEdge(parent, child);
    }
}

function _addSuffixHierarchy(hierarchy: Graph, parts: string[], suffix: string) {
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

export { GraphModel };
