import {GraphService} from "/service/graph.service.js"
import {Dataset} from "/model/dataset.model.js"
import {GraphFilter} from "/model/graph.filter.model.js"
import {LayoutService} from "/service/layout.service.js"

export class DatasetService {
    static singleton = new DatasetService();

    constructor() {
        this.state = new Dataset();
        this.depthCollapseLimit = 3;
        console.log('initialize', this);
    }

    //----- modifications ---------------------------------------------------

    pipeline() {
        return [
            graph => new GraphFilter(this.state.config()).apply(graph),
            GraphService.singleton.nodeReducer((node) => {
                return node.split('.').slice(0, this.depthCollapseLimit).join('.');
            })
        ];
    }

    async loadWorkspace(files) {
        //TODO: load all projects / datasets in a directory (ask right only once)
    }

    async load(folderName, files) {
        this.state = await Dataset.load(folderName, files);
        await GraphService.singleton.rebuildGraph();
        LayoutService.singleton.tree.rebuild(this.state.hierarchy());
        LayoutService.singleton.table.rebuild(this.state.nodes());
    }

}
