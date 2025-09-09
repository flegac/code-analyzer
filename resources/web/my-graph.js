class MyGraph {
    constructor() {
        this.container = createDiv('graph');
        this.graph = null;
        loadScript("https://cdn.jsdelivr.net/npm/three@0.150.1/build/three.min.js");
        loadScript("https://cdn.jsdelivr.net/npm/3d-force-graph");
    }

    build(hierarchy, dependencies, infos, params) {
        this.nodes = [];
        this.groups = {};
        this.nodesMap = {};

        this.dependencies = new Relation('dependencies', dependencies);
        this.hierarchy = new Relation('hierarchy', hierarchy);

        for (const id of Object.keys(dependencies)) {
            const usedBy = this.dependencies.usedBy[id]?.length || 0;
            const dependOn = this.dependencies.dependOn[id]?.length || 0;
            const radius = this.dependencies.usedBy[id]?.length || 0;

            let group = id.split('.').slice(0, params.groupHierarchyDepth).join('.');
            if (usedBy === 0) {
                group = '__source__';
            }
            if (dependOn === 0) {
                group = '__sink__'
            }
            if (dependOn === 0 && usedBy === 0) {
                group = '__disconnected__'
            }

            this.groups[group] = this.groups[group] || [];
            this.groups[group].push(id);
            const node = {
                id,
                group: group,
                radius: radius,
                usedBy: usedBy,
                dependOn: dependOn,
                infos: infos[id] || {}, // x,y,z are induced by forces
            };
            this.nodesMap[id] = node;
            this.nodes.push(node);
        }

        const groupGraph = {}
        for (let [key, group] of Object.entries(this.groups)) {
            const n = group.length;
            for (let i = 0; i < n; i++) {
                for (let j = i + 1; j < n; j++) {
                    const a = group[i];
                    const b = group[j];
                    groupGraph[a] = groupGraph[a] || [];
                    groupGraph[a].push(b);
                }
            }
        }
        this.grouping = new Relation('grouping', groupGraph);
        console.log(this.grouping);
    }


    updateGraph(control) {
        // let group = id.split('.').slice(0, control.params.groupHierarchyDepth).join('.');


        this.graph.numDimensions(control.params.dimension);
        this.graph.d3Force('link').distance(10 * control.params.linkDistance);
        this.graph.d3Force('charge').strength(-control.params.chargeStrength);
        // this.graph.d3Force('prefixCollide', forceGroupCollide(node => node.group, control.params.groupDistance));
        this.graph.d3Force('prefixCollide', forceGroupCollide(
            node => node.id.split('.').slice(0, control.params.groupHierarchyDepth).join('.'),
            control.params.groupDistance
        ));
        this.graph
            .nodeVal(node => node.infos[control.params.nodeSize])
            .nodeRelSize(4)
            .nodeAutoColorBy('group')
        // .linkCurvature(.3)
        ;

        this.nodes.forEach(node => {
            if (node.group === '__disconnected__') {
                node.fx = 0;
                node.fy = 0;
                node.fz = 0;
            }
        });

        const sourceSinkDistance = 5 * control.params.sourceSinkDistance;
        if (control.params.sourceSinkDistanceActive) {
            this.nodes.forEach(node => {
                if (node.group === '__source__') {
                    // node.fx = node.x;
                    // node.fy = node.y; //Math.max(node.y, 100);
                    node.fy = sourceSinkDistance;
                }
            });
            this.nodes.forEach(node => {
                if (node.group === '__sink__') {
                    node.fy = -sourceSinkDistance;
                }
            });
        } else {
            this.nodes.forEach(node => {
                if (node.group === '__source__' || node.group === '__sink__') {
                    node.fy = null;
                }
            });
        }

        // graph.graphInstance.d3ReheatSimulation();
        // this.graphInstance.cooldownTicks(Infinity);
        // this.graphInstance.pauseAnimation();
    }


    renderGraph(hierarchy, dependencies, infos, params) {
        // Nettoyer l'ancienne instance si elle existe
        if (this.graph && typeof this.graph._destructor === 'function') {
            this.graph._destructor(); // méthode interne pour libérer les ressources
        }

        this.build(hierarchy, dependencies, infos, params);
        // this.updateColors(paletteGenerator)
        const nodesMap = this.nodesMap;
        const nodes = this.nodes;
        const links = []
                .concat(this.hierarchy.links)
                .concat(this.dependencies.links)
            // .concat(this.grouping.links)
        ;


        this.graph = ForceGraph3D()(this.container)
            .graphData({nodes, links})
            .nodeLabel(node => {
                let infos = '';
                if (node.infos) {
                    infos = JSON.stringify(node.infos, null, 2);
                }
                return `${node.id}<br>\n${infos}`;
            })
            // .linkAutoColorBy('label')
            .linkColor((link) => {
                if (link.label === 'hierarchy') {
                    // return '#ccc'
                    return '#0000'
                }
                if (link.label === 'dependencies') {
                    // return '#0000'

                    const src = nodesMap[link.source];
                    const dst = nodesMap[link.target];
                    if (src.group === dst.group) {
                        return '#ccc0';
                    }
                    return src.color;
                    // return '#ccc'

                }
            })
        ;

        this.graph.onNodeClick((node, event) => {
            const cameraPos = this.graph.cameraPosition(); // {x, y, z}
            const controls = this.graph.controls();        // OrbitControls ou TrackballControls

            const lookAt = controls.target;
            const dx = node.x - lookAt.x;
            const dy = node.y - lookAt.y;
            const dz = node.z - lookAt.z;

            const newPos = {
                x: cameraPos.x + dx, y: cameraPos.y + dy, z: cameraPos.z + dz
            };
            this.graph.cameraPosition(newPos, node, 1000); // transition vers le nœud
        });

        const resizeObserver = new ResizeObserver(() => {
            this.graph.width(this.container.clientWidth);
            this.graph.height(this.container.clientHeight);
        });
        resizeObserver.observe(this.container);

        // setTimeout(() => {
        //     // graphInstance.d3Force('prefixCollide')?.strength(0);
        //     // graphInstance.d3Force('charge')?.strength(-200);
        //     // graphInstance.d3Force('link').distance(100);
        //     // console.log(graphInstance.d3Force('link').strength(2.));
        //     // console.log(graphInstance.d3Force('charge').strength()());
        //     // graphInstance.d3Force('link')?.strength(.5);
        //     console.log('Simulation arrêtée pour économiser les ressources.');
        // }, 1500); // ou plus selon la taille du graphe
    }

}

