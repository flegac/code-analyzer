import {StoreService} from "/lib/store.service.js"
import {CameraService} from "/lib/camera.service.js"

import {NodeService} from "/display/node.service.js"
import {GraphService} from "/display/graph.service.js";

import {NodeMeshModel} from "/mesh/node.mesh.model.js";


export class StyleService {
    static singleton = new StyleService();

    constructor() {
        this.mesh = StoreService.singleton.store('mesh', {
            isVisible: true,
            scaling: 20.0,
            size: null,
            color: 'group',
        });
        this.text = StoreService.singleton.store('text', {
            isVisible: true,
            showModule: true,
            showClass: true,
            padding: 2,
            fontSize: 64,
            fontFamily: 'Arial',
            textColor: 'white',
            textOffsetY: 20,
        });
        this.links = StoreService.singleton.store('links', {
            relation: {
                color: '#f00',
                colorLow: '#0f0',
                colorHigh: '#f00',
                particles: 0,
                width: 2.0,
            },
            hierarchy: {
                color: '#fff',
                colorLow: '#fff',
                colorHigh: '#fff',
                particles: 0,
                width: 10.0,
            }
        });
        console.log('initialize', this);
    }


    visibleText(node) {
        const category = node.read('category');

        if (!this.text.isVisible) {
            return false;
        }

        if (category === 'Module' && !this.text.showModule) {
            return false;
        }

        if (category !== 'Module' && !this.text.showClass) {
            return false;
        }

        return true;
    }

    visibleMesh(node) {
        const degree = node.read('outgoing').length + node.read('incoming').length;
        return (degree > 0) && this.mesh.isVisible;
    }


    getMesh(node, position) {
        return new NodeMeshModel(node, this, position).mesh;
    }

    getLabel(node) {
        const infos = node.readAll();
        infos.incoming = infos.incoming.length;
        infos.outgoing = infos.outgoing.length;

        for (const key in infos) {
            if (infos[key] === null || key.startsWith('_')) {
                delete infos[key];
            }
        }

        const infosString = JSON.stringify(infos, null, 2);
        return `${node.id}<br>\n${infosString}`;
    }

    textFormatter(parts) {
        if (!Array.isArray(parts) || parts.length === 0) return '';
        if (parts.length === 1) return parts[0];
        if (parts[parts.length - 1].includes('::')) {
            return '::' + parts[parts.length - 1].split('::').slice(-1)
        }
        // if (parts.length === 2) return parts.join('.');
        return parts.slice(-1);
    }

    rebuildMeshes() {
        console.log('StyleService.rebuildMeshes()');
        const G = GraphService.singleton;
        const camPosition = CameraService.singleton.camera().position;
        G.getGraph().nodeThreeObject((node) => this.getMesh(node, camPosition));

    }

    updateMeshes() {
        throw Error('wrong implem')
        G.state.nodes.forEach(node => {
            const meshes = node.read('_meshes');
            const color = node.read('color');
            const radius = node.read('radius');

            if (meshes?.billboard && typeof meshes.billboard.redraw === 'function') {
                meshes.billboard.redraw(color, radius);
            }
        });
    }

    updateNodeSizes() {
        const G = GraphService.singleton;
        const N = NodeService.singleton;
        const S = StyleService.singleton;

        N.updateRadius();

        G.state.nodes.forEach(node => {
            const meshes = node.read('_meshes');
            meshes.group.resizeBillboard(node.read('radius'))
            meshes.group.resizeText(S.mesh.scaling)
        });
    }

    getParticleNumber(link) {
        const G = GraphService.singleton;
        const source = G.findNodeById(link.source.id || link.source);
        const target = G.findNodeById(link.target.id || link.target);

        if (link.label !== 'hierarchy' && source.read('group') === target.read('group')) {
            return 0;
        }
        return this.links[link.label]?.particles ?? 0;
    }

    getLinkColor(link) {
        const G = GraphService.singleton;

        if (link.label === 'hierarchy') {
            return this.links[link.label]?.color ?? '#f00';
        }

        if (link.label === 'relation') {
            //TODO: fix that shit !! strange behavior on links ...
            const source = G.findNodeById(link.source.id || link.source);
            const target = G.findNodeById(link.target.id || link.target);

            if (source.read('group') === target.read('group')) {
                return '#ccc';
            }

            const centrality1 = source.read('centrality');
            const centrality2 = target.read('centrality');
            const c1 = this.links.relation.colorLow;
            const c2 = this.links.relation.colorHigh;
            return interpolateColor(c1, c2, (centrality1 + centrality2) / 2);
        }
        return this.links[link.label]?.color ?? '#f00';
    }

    apply() {
        const G = GraphService.singleton;
        const N = NodeService.singleton;

        // ----- NODES ---------------------------------
        N.updateGroup();
        N.updateRadius();
        N.updateColor();

        //TODO: just modify color/scale of geometries
        this.rebuildMeshes()
        // this.updateMeshes()

        const graph = G.getGraph();
        graph.nodeLabel(this.getLabel);

        // ----- LINKS ----------------------------------
        graph
            .linkCurvature(.0)
            .linkDirectionalParticles((link) => this.getParticleNumber(link))
            .linkDirectionalParticleWidth((link) => 2 * this.links[link.label]?.width ?? 0)
            .linkDirectionalParticleSpeed(.01)
            .linkWidth((link) => this.links[link.label]?.width)
            .linkColor((link) => this.getLinkColor(link))
            .linkVisibility((link) => this.links[link.label]?.width > 0)
        // .linkOpacity((link) => this.links.getOpacity(link))
        ;
    }
}

function interpolateColor(c1, c2, value, min = 0, max = 1) {
    const ratio = Math.max(0, Math.min(1, (value - min) / (max - min)));

    // Convertir #rgb en [r, g, b]
    const hexToRGB = hex => {
        const r = parseInt(hex[1] + hex[1], 16);
        const g = parseInt(hex[2] + hex[2], 16);
        const b = parseInt(hex[3] + hex[3], 16);
        return [r, g, b];
    };

    const [r1, g1, b1] = hexToRGB(c1);
    const [r2, g2, b2] = hexToRGB(c2);

    // Interpolation linéaire
    const r = Math.round(r1 + (r2 - r1) * ratio);
    const g = Math.round(g1 + (g2 - g1) * ratio);
    const b = Math.round(b1 + (b2 - b1) * ratio);

    return `rgb(${r},${g},${b})`;
}

