import {GraphService} from "/display/graph.service.js";
import {LayoutService} from "/core/layout.service.js";
import {LinkStyle} from "/display/link.style.model.js";
import {NodeStyle} from "/display/node.style.model.js";
import {CameraService} from "/display/camera.service.js";


export class GraphStyleService {
    static singleton = new GraphStyleService();

    constructor() {
        this.nodes = new NodeStyle();
        this.links = new LinkStyle();
        console.log('initialize', this);
    }

    async apply() {
        const graph = LayoutService.singleton.graph.getGraph();

        // ----- NODES ---------------------------------
        //TODO: externalize that (?)
        const G = GraphService.singleton;
        G.updateDisplayParameters();
        G.updateGroup();
        //required for nodeAutoColorBy()
        G.state.nodes.forEach(node => node.color = null);
        const camPosition = CameraService.singleton.camera().position;
        graph
            .nodeAutoColorBy('group')
            .nodeThreeObject((node) => this.nodes.getMesh(node, camPosition))
            .nodeLabel(this.nodes.getLabel);

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
