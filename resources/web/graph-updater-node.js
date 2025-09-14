class GraphUpdaterNode {
    constructor(updater) {
        this.updater = updater;
        this.paletteGenerator = chroma
            .scale(['#f00', '#0f0', '#00f',])
            // .mode('lab')           // interpolation en CIE Lab (perceptuellement uniforme)
            // .mode('lch')
            .mode('hsl');
    }

    async apply(graph) {
        // const uniqueGroups = graph.uniqueGroups();
        // const k = uniqueGroups.length;
        // const palette = this.paletteGenerator.colors(k)
        // const decal = 0; //1 + Math.round(k / 3)
        // graph.groupColors = {};
        // uniqueGroups.forEach((grp, idx) => {
        //     graph.groupColors[grp] = palette[(idx + decal) % k];
        // });
        // fix nodes
        // graph.nodes.forEach(node => {
        //     node.color = graph.groupColors[node.group];
        // });

        const infos = await this.updater.children.dataset.moduleInfos();
        for (let node of graph.nodes) {
            node.infos = infos[node.id] || {};
        }

        graph.graph
            .nodeVal(node => node.infos[this.updater.params.nodes.size])
            // .nodeColor(node => node.infos[this.updater.params.nodes.color])
            .nodeAutoColorBy('group')
            .nodeRelSize(4)
        ;

        graph.updateText(this.updater.params.nodes);

    }
}