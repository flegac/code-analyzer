import {StoreService} from "../store.service.js"
import {CameraService} from "../camera.service.js"

import {NodeService} from "./node.service.js"
import {GraphService} from "./graph.service.js";

import {NodeMeshModel} from "../mesh/node.mesh.model.js";


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
            opacity: 1.,
            particles: 0,
            width: 2.0,
            relation: {
                isVisible: true,
                color: '#f00',
                colorLow: '#0f0',
                colorHigh: '#f00',
            },
            hierarchy: {
                isVisible: true,
                color: '#fff',
                colorLow: '#fff',
                colorHigh: '#fff',
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


    getMesh(node, camPosition) {
        return new NodeMeshModel(node, this, camPosition).mesh;
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

    getLinkColor(link) {
        const G = GraphService.singleton;

        if (link.label === 'hierarchy') {
            return this.links[link.label]?.color;
        }

        if (link.label === 'relation') {
            const source = G.findNodeById(link.source.id || link.source);
            const target = G.findNodeById(link.target.id || link.target);


            // const metrics = 'centrality';
            const metrics = 'cycles';

            const value1 = source.read(metrics);
            const value2 = target.read(metrics);
            const value = Math.min(value1, value2);

            const c1 = this.links.relation.colorLow;
            const c2 = this.links.relation.colorHigh;
            return interpolateColor(c1, c2, value);
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
            .linkDirectionalParticles((link) => this.links.particles)
            .linkDirectionalParticleWidth(2. * this.links.width)
            .linkDirectionalParticleSpeed(.01)
            .linkWidth((link) => this.links.width)
            .linkColor((link) => this.getLinkColor(link))
            .linkVisibility((link) => {
                const hasWidth = this.links.width > 0;
                return hasWidth && this.links[link.label]?.isVisible;
            })
            .linkOpacity(1.)
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

