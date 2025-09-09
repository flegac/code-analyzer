class Relation {
    constructor(label, graph) {
        this.label = label
        this.dependOn = graph
        this.usedBy = {};
        this.nodes = new Set();
        this.links = [];

        for (const [source, targets] of Object.entries(graph)) {
            this.nodes.add(source);
            for (const target of targets) {
                this.nodes.add(target);
                this.usedBy[target] = this.usedBy[target] || [];
                this.usedBy[target].push(source);
                this.links.push({source, target, label});
            }
        }


        function computeSubtreeSize(node, visited = new Set()) {
            if (visited.has(node)) return 1;
            visited.add(node);
            let size = 1;
            for (let child of graph[node] || []) {
                size += computeSubtreeSize(child, visited);
            }
            return size;
        }

    }


}