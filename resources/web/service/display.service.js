import { LayoutService } from "/service/layout.service.js"
import { Nodes, Links } from "/model/config.model.js";
import { defaultDisplayProvider } from "/model/display-provider.js";


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
