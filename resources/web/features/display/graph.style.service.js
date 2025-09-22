import { GraphService } from "/display/graph.service.js";
import { LayoutService } from "/core/layout.service.js";
import { GraphLinkStyle } from "/display/graph.style.link.model.js";
import { GraphNodeStyle } from "/display/graph.style.node.model.js";

class Nodes {
    constructor() {
        this.mesh = {
            baseRadius: 12.0,
            isVisible: true,
            colorGroupDepthRange: 2,
            size: 'imported',
            color: 'group',
        }
        this.text = {
            isVisible: true,
            hiddenDepthRange: 3,
            scaling: 2.0,
            padding: 2,
            fontSize: 64,
            fontFamily: 'Arial',
            textColor: 'white',
            textOffsetY: 10,
            textFormatter: (parts) => {
                if (!Array.isArray(parts) || parts.length === 0) return '';
                if (parts.length === 1) return parts[0];
                // if (parts.length === 2) return parts.join('.');
                return parts.slice(-1);
            }
        };
    }
}

class Links {
    constructor() {
        this.relation = {
            color: '#f00',
            particles: 1,
            width: 5.0,
        };
        this.hierarchy = {
            color: '#ffff00',
            particles: 0,
            width: 10.0,
        };
    }
}

export class GraphStyleService {
    static singleton = new GraphStyleService();

    constructor() {
        this.nodes = new Nodes();
        this.links = new Links();

        this.nodeStyle = new GraphNodeStyle();
        this.linkStyle = new GraphLinkStyle();

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
        graph
            .nodeAutoColorBy('group')
            .nodeThreeObject(this.nodeStyle.getMesh)
            .nodeLabel(this.nodeStyle.getLabel);

        // ----- LINKS ----------------------------------
        graph
            .linkCurvature(.0)
            .linkDirectionalParticles(this.linkStyle.getParticleNumber)
            .linkDirectionalParticleWidth(this.linkStyle.getParticleWidth)
            .linkDirectionalParticleSpeed(.01)
            .linkWidth(this.linkStyle.getWidth)
            .linkColor(this.linkStyle.getColor)
            .linkVisibility(this.linkStyle.getVisibility)
            ;

    }
}
