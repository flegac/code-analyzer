import {AttributeClusterStrategy, ModuleDepthClusterStrategy} from "./cluster.strategy.model.js"

export class ClusterService {
    static singleton = new ClusterService();

    constructor() {
        this.groupStrategy = new ModuleDepthClusterStrategy(2);
        this.collapseStrategy = new ModuleDepthClusterStrategy(5);
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