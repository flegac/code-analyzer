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
    }

    hierarchy() {
        return buildHierarchy(this);
    }
}

function buildHierarchy(graph) {
    const nodes = graph.nodes;
    const hierarchy = {};

    for (const full of nodes) {
        const [prefix, suffix] = full.split("::");
        const parts = prefix ? prefix.split(".") : [];

        for (let i = 1; i < parts.length; i++) {
            const parent = parts.slice(0, i).join(".");
            const child = parts.slice(0, i + 1).join(".");

            if (!hierarchy[parent]) {
                hierarchy[parent] = [];
            }
            if (!hierarchy[parent].includes(child)) {
                hierarchy[parent].push(child);
            }
        }

        if (suffix) {
            let a = null;
            let b = null;
            [a, b] = suffix.split("/");

            if (a !== null) {
                const base = parts.join(".");
                const className = [base, a].join('::');
                if (!hierarchy[base]) {
                    hierarchy[base] = [];
                }
                hierarchy[base].push(className);
                if (b != null) {
                    const methodName = [className, b].join('/');
                    if (!hierarchy[className]) {
                        hierarchy[className] = [];
                    }
                    hierarchy[className].push(methodName);
                }
            }
        }
    }
    // const raw = await fetch(this.params.hierarchyPath).then(res => res.json());
    return new Relation('hierarchy', hierarchy);
}
