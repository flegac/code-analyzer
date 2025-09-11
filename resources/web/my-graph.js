class MyGraph {
    constructor() {
        this.container = createDiv('graph');
        this.graph = null;
        this.groups = new Set();
        this.paletteGenerator = chroma
            .scale(['#f00', '#0f0', '#00f',])
            // .mode('lab')           // interpolation en CIE Lab (perceptuellement uniforme)
            // .mode('lch')
            .mode('hsl');
    }

    updateColors() {
        // compute color map
        const uniqueGroups = Array.from(new Set(this.nodes.map(node => node.group)));
        const k = uniqueGroups.length;
        const palette = this.paletteGenerator.colors(k)
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

    updateGroups() {
        const groups = this.groups;

        for (let node of Object.values(this.nodesMap)) {
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
            node.infos['group'] = group;
        }
        this.updateColors()
    }

    rebuild(hierarchy, dependencies, infos, params) {
        this.nodes = [];
        this.nodesMap = {};
        this.dependencies = dependencies;
        this.hierarchy = hierarchy;

        for (const id of dependencies.nodes) {
            const usedBy = this.dependencies.usedBy[id]?.length || 0;
            const dependOn = this.dependencies.dependOn[id]?.length || 0;
            const radius = this.dependencies.usedBy[id]?.length || 0;
            let group = id.split('.').slice(0, params.groupHierarchyDepth).join('.');
            const xxx = infos[id] || {};
            xxx['group'] = group;
            const node = {
                id,
                group: group,
                radius: radius,
                usedBy: usedBy,
                dependOn: dependOn,
                infos: xxx,
                // x,y,z are induced by forces
            };
            this.nodesMap[id] = node;
            this.nodes.push(node);
        }

        this.updateGroups()

    }


    updateGraph(control) {
        // let group = id.split('.').slice(0, control.params.groupHierarchyDepth).join('.');

        this.updateGroups();

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

        // this.graph.d3ReheatSimulation();
        // this.graph.cooldownTicks(Infinity);
        // this.graph.pauseAnimation();
    }


    renderGraph(hierarchy, dependencies, infos, params) {
        // Nettoyer l'ancienne instance si elle existe
        if (this.graph && typeof this.graph._destructor === 'function') {
            this.graph._destructor(); // méthode interne pour libérer les ressources
        }

        this.rebuild(hierarchy, dependencies, infos, params);
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
    }

}

