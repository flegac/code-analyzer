import {Metadata} from "../project/metadata.model.js";
import {GraphService} from "./graph.service.js";
import {StyleService} from "./style.service.js";

export class LinkService extends Metadata {
    static singleton = new LinkService();

    updateWidth() {
        //TODO

        const G = GraphService.singleton;
        const S = StyleService.singleton;
        const scaling = S.mesh.scaling;

        G.state.links.forEach(link => {
            link.write('radius', radius * scaling);
        });
    }

    updateColor() {
        //TODO
        const G = GraphService.singleton;
        const S = StyleService.singleton;

        G.state.links.forEach(link => {
            link.write('color', color);
        });
    }

}