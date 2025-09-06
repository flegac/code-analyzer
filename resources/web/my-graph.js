class MyGraph {
    constructor(data = {}) {
        this.container = document.getElementById('graph');
        this.graphInstance = null;
        this.data = data; // Format { a: ['b','c'], ... }

    }

    computeNodePosition(id) {
        return {
            x: (Math.random() - 0.5) * 100, y: (Math.random() - 0.5) * 100, z: (Math.random() - 0.5) * 100
        };
    }

    forceGroupCollide(groupFn, groupDistance = 1) {
        let nodes;
        const strength = 1.; // CONFIG.groupForceStrength();
        const baseDistance = groupDistance; //groupDistance; //50 * CONFIG.groupForceDistance();

        function force(alpha) {

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
                        const minDist = 100 * baseDistance + (a.radius + b.radius);
                        const maxDist = 200 * baseDistance + (a.radius + b.radius);


                        let shift = .0;
                        if (dist > maxDist) {

                        } else if (dist < maxDist) {
                            shift = -((maxDist - dist) / maxDist);
                        } else {
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

    build(modulePrefixDepth) {
        this.usedBy = {};
        this.nodes = [];
        this.links = [];
        this.groups = {};

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

    updateGraph(control) {
        this.graphInstance.numDimensions(control.dimension());
        this.graphInstance.d3Force('link').distance(10 * control.linkDistance());
        this.graphInstance.d3Force('charge').strength(-control.chargeStrength());
        this.graphInstance.d3Force('prefixCollide', this.forceGroupCollide(node => node.group, control.groupDistance()));

        // graph.graphInstance.d3ReheatSimulation();
        this.graphInstance.cooldownTicks(Infinity);

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

        // Nettoyer l'ancienne instance si elle existe
        if (this.graphInstance && typeof this.graphInstance._destructor === 'function') {
            this.graphInstance._destructor(); // méthode interne pour libérer les ressources
        }


        this.build(modulePrefixDepth);
        this.updateColors(paletteGenerator)
        const {nodes, links} = this;


        // Créer une nouvelle instance
        const graphInstance = ForceGraph3D()(this.container)
            .width(window.innerWidth)
            .height(window.innerHeight)
            .graphData({nodes, links})
            .nodeLabel('id')
            .nodeVal('inDeg')
            .nodeColor('color')
            // .nodeAutoColorBy('group')
            // .linkCurvature(.3)
            .linkDirectionalParticles(2)
            .linkDirectionalArrowLength(3)
            .linkDirectionalArrowColor(() => '#999')
            .linkColor(() => '#ccc')
            .nodeRelSize(8)
            .d3Force('prefixCollide', this.forceGroupCollide(node => node.group));
        graphInstance.onNodeClick((node, event) => {

            const cameraPos = graphInstance.cameraPosition(); // {x, y, z}
            const controls = graphInstance.controls();        // OrbitControls ou TrackballControls

            const lookAt = controls.target;
            const dx = node.x - lookAt.x;
            const dy = node.y - lookAt.y;
            const dz = node.z - lookAt.z;

            const newPos = {
                x: cameraPos.x + dx,
                y: cameraPos.y + dy,
                z: cameraPos.z + dz
            };
            graphInstance.cameraPosition(newPos, node, 1000); // transition vers le nœud
        });
        this.graphInstance = graphInstance;


        setTimeout(() => {
            // graphInstance.d3Force('prefixCollide')?.strength(0);
            // graphInstance.d3Force('charge')?.strength(-200);
            // graphInstance.d3Force('link').distance(100);
            // console.log(graphInstance.d3Force('link').strength(2.));
            // console.log(graphInstance.d3Force('charge').strength()());
            // graphInstance.d3Force('link')?.strength(.5);
            console.log('Simulation arrêtée pour économiser les ressources.');
        }, 1500); // ou plus selon la taille du graphe
    }


}