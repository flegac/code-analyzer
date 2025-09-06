class GraphDisplay {
    constructor() {
        this.graphInstance = null;
        this.tree = new TreeView();
        this.controls = new Controls();
        this.infos = new Infos();
        this.legend = new Legend();
        this.paletteGenerator = chroma
            .scale(['#f00', '#0f0', '#00f',])
            // .mode('lab')           // interpolation en CIE Lab (perceptuellement uniforme)
            // .mode('lch')
            .mode('hsl');

        this.graphDiv = document.getElementById('graph');
        this.controls.WIDGETS.groupForceStrength.addEventListener('input', () => {
            document.getElementById('group-force-strength-value').textContent = this.controls.groupForceStrength()
            this.updateGraph();
        });

        this.controls.WIDGETS.groupForceDistance.addEventListener('input', () => {
            document.getElementById('group-force-distance-value').textContent = this.controls.groupForceDistance()
            this.updateGraph();
        });
    }


    updateGraph() {
        this.graphInstance.numDimensions(this.controls.dimension());
        this.graphInstance.d3Force('charge').distanceMax(10 * this.controls.groupForceDistance());
        this.graphInstance.d3Force('charge').strength(-10);
        // this.graphInstance.d3ReheatSimulation();
        this.graphInstance.cooldownTicks(Infinity);
    }

    async loadGraph() {
        try {
            const rawData = await fetch(this.controls.dataPath()).then(res => res.json());
            const graph = new MyGraph(rawData);
            display.renderGraph(graph)
            display.updateGraph();

            this.infos.render(graph);
            this.legend.render(graph);
            this.tree.render(rawData);

            const scene = this.graphInstance.scene();

            const axesHelper = new THREE.AxesHelper(500); // taille des axes
            axesHelper.position.set(0, 0, 0);
            scene.add(axesHelper);
        } catch (err) {
            alert('Erreur lors du chargement du JSON : ' + err.message);
        }
    }


    renderGraph(graph) {
        graph.build(this.controls.modulePrefixDepth());
        graph.updateColors(this.paletteGenerator)
        const {nodes, links} = graph;


        // Nettoyer l'ancienne instance si elle existe
        if (this.graphInstance && typeof this.graphInstance._destructor === 'function') {
            this.graphInstance._destructor(); // méthode interne pour libérer les ressources
        }

        // Créer une nouvelle instance
        this.graphInstance = ForceGraph3D()(this.graphDiv)
            .width(window.innerWidth)
            .height(window.innerHeight)
            .graphData({nodes, links})
            .nodeLabel('id')
            .nodeVal('inDeg')
            .nodeColor('color')
            // .nodeAutoColorBy('group')
            .linkCurvature('curvature')
            .linkDirectionalParticles(2)
            .linkDirectionalArrowLength(3)
            .linkDirectionalArrowColor(() => '#999')
            .linkColor(() => '#ccc')
            .nodeRelSize(4)
            .d3Force('prefixCollide', forceGroupCollide(node => node.group))
        // .onNodeClick(node => {
        //     const {x, y, z} = node;
        //     graphInstance.centerAt(x, y, z, 1000); // durée en ms
        //     graphInstance.zoom(4, 1000); // facteur de zoom, durée en ms
        // })
        ;


        // setTimeout(() => {
        //     graphInstance.d3Force('prefixCollide')?.strength(0);
        //     graphInstance.d3Force('charge')?.strength(0);
        //     graphInstance.d3Force('link')?.strength(0);
        //     console.log('Simulation arrêtée pour économiser les ressources.');
        // }, 5000); // ou plus selon la taille du graphe
    }

}

class MyGraph {
    constructor(data) {
        this.container = '';
        this.graphInstance = null;
        this.data = data; // Format { a: ['b','c'], ... }
        this.usedBy = {};
        this.nodes = [];
        this.links = [];
        this.groups = {};
    }

    computeNodePosition(id) {
        return {
            x: (Math.random() - 0.5) * 100, y: (Math.random() - 0.5) * 100, z: (Math.random() - 0.5) * 100
        };
    }

    build(modulePrefixDepth) {
        // compute links & reverse graph
        for (const [source, targets] of Object.entries(this.data)) {
            for (const target of targets) {
                this.usedBy[target] = this.usedBy[target] || [];
                this.usedBy[target].push(source);
                this.links.push({source, target});
            }
        }

        const nn = modulePrefixDepth;
        for (const id of Object.keys(this.data)) {
            const subtreeSize = this.computeSubtreeSize(id);
            const inDeg = this.usedBy[id]?.length || 0;
            const outDeg = this.data[id]?.length || 0;
            const radius = Math.pow(subtreeSize, 1.);

            const parent = id.split('.').slice(0, nn).join('.');
            let group = id.split('.').slice(0, nn + 1).join('.');
            if (outDeg === 0 && inDeg === 0) {
                group = '__disconnected__'
            }


            this.groups[group] = this.groups[group] || [];
            this.groups[group].push(id);
            this.nodes.push({
                id,
                parent: parent,
                group: group,
                radius: radius,
                subtreeSize: subtreeSize,
                inDeg: inDeg,
                outDeg: outDeg, ...this.computeNodePosition(id),
            });
        }


    }

    updateColors(paletteGenerator) {
        // compute color map
        const uniqueGroups = Array.from(new Set(this.nodes.map(node => node.group)));
        const k = uniqueGroups.length;
        const palette = paletteGenerator.colors(k)
        const decal = 0; //1 + Math.round(k / 3)
        this.groupColors = {};
        uniqueGroups.forEach((grp, idx) => {
            this.groupColors[grp] = palette[(idx + decal) % k];
        });
        // fix nodes
        this.nodes.forEach(node => {
            node.color = this.groupColors[node.group];
        });
    }


    computeSubtreeSize(node, visited = new Set()) {
        if (visited.has(node)) return 1;
        visited.add(node);
        let size = 1;
        for (let child of this.data[node] || []) {
            size += this.computeSubtreeSize(child, visited);
        }
        return size;
    }

    renderGraph(modulePrefixDepth, paletteGenerator) {
        const graph = this;

        graph.build(modulePrefixDepth);
        graph.updateColors(paletteGenerator)
        const {nodes, links} = graph;


        // Nettoyer l'ancienne instance si elle existe
        if (this.graphInstance && typeof this.graphInstance._destructor === 'function') {
            this.graphInstance._destructor(); // méthode interne pour libérer les ressources
        }

        // Créer une nouvelle instance
        this.graphInstance = ForceGraph3D()(this.container)
            .width(window.innerWidth)
            .height(window.innerHeight)
            .graphData({nodes, links})
            .nodeLabel('id')
            .nodeVal('inDeg')
            .nodeColor('color')
            // .nodeAutoColorBy('group')
            .linkCurvature('curvature')
            .linkDirectionalParticles(2)
            .linkDirectionalArrowLength(3)
            .linkDirectionalArrowColor(() => '#999')
            .linkColor(() => '#ccc')
            .nodeRelSize(4)
            .d3Force('prefixCollide', forceGroupCollide(node => node.group))
        // .onNodeClick(node => {
        //     const {x, y, z} = node;
        //     graphInstance.centerAt(x, y, z, 1000); // durée en ms
        //     graphInstance.zoom(4, 1000); // facteur de zoom, durée en ms
        // })
        ;


        // setTimeout(() => {
        //     graphInstance.d3Force('prefixCollide')?.strength(0);
        //     graphInstance.d3Force('charge')?.strength(0);
        //     graphInstance.d3Force('link')?.strength(0);
        //     console.log('Simulation arrêtée pour économiser les ressources.');
        // }, 5000); // ou plus selon la taille du graphe
    }


}


function forceGroupCollide(groupFn) {
    let nodes;


    function force(alpha) {
        const strength = .9; // CONFIG.groupForceStrength();
        const baseDistance = 10; //50 * CONFIG.groupForceDistance();

        const groupMap = new Map();
        for (const node of nodes) {
            const group = groupFn(node);
            if (!groupMap.has(group)) groupMap.set(group, []);
            groupMap.get(group).push(node);
        }

        for (const groupNodes of groupMap.values()) {
            const n = groupNodes.length;
            for (let i = 0; i < n; i++) {
                for (let j = i + 1; j < n; j++) {
                    const a = groupNodes[i];
                    const b = groupNodes[j];
                    const dx = b.x - a.x;
                    const dy = b.y - a.y;
                    const dz = b.z - a.z;
                    const dist = Math.hypot(dx, dy, dz);
                    const minDist = baseDistance + (a.radius + b.radius);
                    const maxDist = 2 * baseDistance + (a.radius + b.radius);


                    let shift = .0;
                    if (dist < maxDist) {
                        shift = -((maxDist - dist) / maxDist);
                    } else if (dist > minDist) {
                        shift = ((minDist - dist) / dist);
                    } else if (dist < minDist) {
                        shift = ((minDist - dist) / minDist);
                    }
                    shift *= alpha * strength / n;
                    const sx = dx * shift, sy = dy * shift, sz = dz * shift;
                    b.x += sx;
                    b.y += sy;
                    b.z += sz;
                    a.x -= sx;
                    a.y -= sy;
                    a.z -= sz;
                }
            }
        }
    }

    force.initialize = _ => {
        nodes = _;
    };
    return force;
}


