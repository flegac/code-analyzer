import { GraphService } from "/display/graph.service.js";
import { ModuleDepthClusterStrategy, AttributeClusterStrategy } from "/cluster/cluster.strategy.model.js"

export class ClusterService {
    static singleton = new ClusterService();

    constructor() {
        this.groupStrategy = new AttributeClusterStrategy('category');
        this.collapseStrategy = new ModuleDepthClusterStrategy(2);
    }

    setGroupByDepth(depth) {
        this.groupStrategy = new ModuleDepthClusterStrategy(depth);
    }

    setGroupByLabel(label = 'group') {
        this.groupStrategy = new AttributeClusterStrategy(label);
    }

    setCollapseByDepth(depth) {
        this.collapseStrategy = new ModuleDepthClusterStrategy(depth);
    }

}