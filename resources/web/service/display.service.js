import {LayoutService} from "/service/layout.service.js"
import {defaultDisplayProvider} from "/model/display-provider.js";


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
            scaling: 1.0,
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
            width: 1.0,
        };
        this.hierarchy = {
            color: '#ffff00',
            particles: 0,
            width: 10.0,
        };
    }
}

export class DisplayService {
    static singleton = new DisplayService();

    constructor() {
        this.nodes = new Nodes();
        this.links = new Links();
        this.displayProvider = defaultDisplayProvider
        console.log('initialize', this);
    }

    async apply() {
        const graph = LayoutService.singleton.graph;
        const state = DisplayService.singleton.nodes;
        const displayProvider = this.displayProvider();
        await displayProvider.apply(graph, state);
    }
}
