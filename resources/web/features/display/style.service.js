import { GraphService } from "/display/graph.service.js"
import { LinkStyle } from "/display/link.style.model.js"
import { NodeStyle } from "/display/node.style.model.js"
import { CameraService } from "/display/camera.service.js"
import { StoreService } from "/core/store.service.js"
import { MetadataService } from "/metadata/metadata.service.js"

export class StyleService {
    static singleton = new StyleService();

    constructor() {
        this.nodes = StoreService.singleton.store('nodes', new NodeStyle());
        this.links = StoreService.singleton.store('links', new LinkStyle());
        console.log('initialize', this);
    }

    rebuildMeshes() {
        console.log('StyleService.rebuildMeshes()');
        const G = GraphService.singleton;
        const camPosition = CameraService.singleton.camera().position;
        G.getGraph().nodeThreeObject((node) => this.nodes.getMesh(node, camPosition));

    }

    updateMeshes() {
        throw Error('wrong implem')
        G.state.nodes.forEach(node => {
            const meshes = node.read('_meshes');
            const color = node.read('color');
            const radius = node.read('radius');

            if (meshes?.billboard && typeof meshes.billboard.redraw === 'function') {
                meshes.group.resize(radius);
                meshes.billboard.redraw(color, radius);
            }
        });
    }

    apply() {
        console.log('StyleService.singleton.apply()');
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

        graph.nodeLabel(this.nodes.getLabel);

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
