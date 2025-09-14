class GraphUpdaterGroup {
    constructor(controls) {
        this.controls = controls;
    }

    async apply(graph) {
        const groups = this.controls.groups;

        for (let node of Object.values(graph.nodesMap)) {
            const id = node.id;
            let parts = id.split('.');
            let group = id;
            for (let i = 1; i < parts.length; i++) {
                let g = parts.slice(0, -i).join('.')
                if (groups.has(g)) {
                    group = g;
                    break;
                }
            }

            // let group = id.split('.').slice(0, this.updater.params.physics.groupHierarchyDepth).join('.');
            if (node.usedBy === 0) {
                group = '__source__';
            }
            if (node.dependOn === 0) {
                group = '__sink__'
            }
            if (node.dependOn === 0 && node.usedBy === 0) {
                group = '__disconnected__'
            }
            node.group = group;
        }
    }
}