import {GraphService} from "/display/graph.service.js"
import {LinkStyle} from "/display/link.style.model.js"
import {CameraService} from "/display/camera.service.js"
import {StoreService} from "/lib/store.service.js"
import {MetadataService} from "/display/metadata.service.js"
import {NodeMeshModel} from "/mesh/node.mesh.model.js";

export class StyleService {
    static singleton = new StyleService();

    constructor() {
        this.mesh = StoreService.singleton.store('mesh', {
            scaling: 20.0,
            isVisible: true,
            size: null,
            color: 'group',
        });
        this.text = StoreService.singleton.store('text', {
            isVisible: true,
            hiddenDepthRange: 3,
            padding: 2,
            fontSize: 64,
            fontFamily: 'Arial',
            textColor: 'white',
            textOffsetY: 20,
        });
        this.links = StoreService.singleton.store('links', new LinkStyle());
        console.log('initialize', this);
    }


    visibleText(node) {
        if (!this.text.isVisible) {
            return false;
        }
        console.log(node.read('category'))

        if (node.read('category') !== 'Module') {
            return true;
        }

        return node.id.split('.').length <= this.text.hiddenDepthRange;
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
        const M = MetadataService.singleton;
        const S = StyleService.singleton;

        M.updateRadius();

        G.state.nodes.forEach(node => {
            const meshes = node.read('_meshes');
            meshes.group.resizeBillboard(node.read('radius'))
            meshes.group.resizeText(S.mesh.scaling)
        });
    }

    apply() {
        const G = GraphService.singleton;
        const M = MetadataService.singleton;

        // ----- NODES ---------------------------------
        M.updateGroup();
        M.updateRadius();
        M.updateColor();

        //TODO: just modify color/scale of geometries
        this.rebuildMeshes()
        // this.updateMeshes()

        const graph = G.getGraph();
        graph.nodeLabel(this.getLabel);

        // ----- LINKS ----------------------------------
        graph
            .linkCurvature(.0)
            .linkDirectionalParticles((link) => this.links.getParticleNumber(link))
            .linkDirectionalParticleWidth((link) => this.links.getParticleWidth(link))
            .linkDirectionalParticleSpeed(.01)
            .linkWidth((link) => this.links.getWidth(link))
            .linkColor((link) => this.links.getColor(link))
            .linkVisibility((link) => this.links.getVisibility(link))
        // .linkOpacity((link) => this.links.getOpacity(link))
        ;
    }
}
