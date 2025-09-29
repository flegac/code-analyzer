import { SS } from "../store.service.js"
import { CC } from "../camera.service.js"

import { NN } from "./node.service.js"
import { G } from "./graph.service.js";

import { NodeMeshModel } from "../mesh/node.mesh.model.js";


const DEFAULT_STORE = SS.store('visuals', {
    mesh: {
        isVisible: true,
        scaling: .5,
        size: null,
        color: 'group',
    },
    text: {
        isVisible: true,
        showModule: true,
        showClass: true,
        padding: 2,
        fontSize: 64,
        fontFamily: 'Arial',
        textColor: 'white',
        textOffsetY: 20,
    },
    links: {
        opacity: 0.35,
        metrics: 'centrality',
        particles: 1,
        particleWidthMultiplier: 2.,
        width: 2.0,
        colorLow: '#0f0',
        colorHigh: '#f00',
        relation: {
            isVisible: true,
            color: '#f00',
        },
        hierarchy: {
            isVisible: true,
            color: '#fff',
        }
    }
});

export class VisualService {
    static singleton = new VisualService();

    constructor() {
        this.state = DEFAULT_STORE;
        console.log('initialize', this);
    }

    expectdRadius(value = 1) {
        const radius = Math.max(1, Math.cbrt(1 + value));
        const maxSize = 100.;
        return radius * this.state.mesh.scaling * maxSize;
    }


    visibleText(node) {
        const category = node.read('category');

        if (!this.state.text.isVisible) {
            return false;
        }

        if (category === 'Module' && !this.state.text.showModule) {
            return false;
        }

        if (category !== 'Module' && !this.state.text.showClass) {
            return false;
        }

        return true;
    }

    visibleMesh(node) {
        const degree = node.read('relation.out').length + node.read('relation.in').length;
        return (degree > 0) && this.state.mesh.isVisible;
    }


    getMesh(node, camPosition) {
        return new NodeMeshModel(node, this, camPosition).mesh;
    }

    getLabel(node) {
        const infos = node.readAll();
        [
            'relation.in',
            'relation.out',
            'hierarchy.in',
            'hierarchy.out',
        ].forEach(k => {
            infos[k] = infos[k].length;
        })

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
        console.log('VisualService.rebuildMeshes()');
        const camPosition = CC.camera().position;
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
        NN.updateRadius();

        G.state.nodes.forEach(node => {
            const meshes = node.read('_meshes');
            meshes.group.resizeBillboard(node.read('radius'))
            meshes.group.resizeText(V.state.mesh.scaling)
        });
    }

    getLinkColor(link) {
        const links = this.state.links;
        if (link.label === 'hierarchy') {
            return links[link.label]?.color;
        }

        if (link.label === 'relation') {
            const source = G.findNodeById(link.source.id || link.source);
            const target = G.findNodeById(link.target.id || link.target);

            const metrics = links.metrics;

            const value1 = source.read(metrics);
            const value2 = target.read(metrics);
            const value = (value1 + value2) * .5;

            const c1 = links.colorLow;
            const c2 = links.colorHigh;
            return interpolateColor(c1, c2, value);
        }
        return links[link.label]?.color ?? '#f00';
    }

    apply() {

        // ----- NODES ---------------------------------
        NN.updateGroup();
        NN.updateRadius();
        NN.updateColor();

        //TODO: just modify color/scale of geometries
        this.rebuildMeshes()
        // this.updateMeshes()

        const graph = G.getGraph();
        graph.nodeLabel(this.getLabel);

        // ----- LINKS ----------------------------------
        const links = this.state.links;
        graph
            .linkCurvature(.0)
            .linkDirectionalParticles((link) => 1 + links.particles)
            .linkDirectionalParticleWidth(links.particleWidthMultiplier * links.width)
            .linkDirectionalParticleSpeed(.01)
            .linkWidth((link) => link.label === 'hierarchy' ? 10 : links.width)
            .linkColor((link) => this.getLinkColor(link))
            .linkVisibility((link) => {
                const hasWidth = links.width > 0;
                return hasWidth && links[link.label]?.isVisible;
            })
            .linkOpacity(links.opacity)
            ;
    }
}
export const V = VisualService.singleton;


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

