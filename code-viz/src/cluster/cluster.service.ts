import { AttributeClusterStrategy } from "./attribute.cluster.strategy.js";
import { DepthClusterStrategy } from "./depth.cluster.strategy.js";
import { WardClusterStrategy } from "./ward.cluster.js";
import { P } from "../project/project.service.js";
import { ClusterStrategy } from "./cluster.strategy.js";

export class ClusterService {
    static singleton = new ClusterService();
    groupStrategy: ClusterStrategy;
    collapseStrategy: ClusterStrategy;

    constructor() {
        this.groupStrategy = new DepthClusterStrategy(3);
        this.collapseStrategy = new DepthClusterStrategy(5);
    }


    setGroupByDepth(depth: number) {
        this.groupStrategy = new DepthClusterStrategy(depth);
    }

    setGroupByLabel(label = 'group') {
        this.groupStrategy = new AttributeClusterStrategy(label);
    }

    setGroupByWard(clusterNumber = 5) {
        const graph = P.project.relation();
        this.groupStrategy = new WardClusterStrategy(graph, clusterNumber);
    }

    setCollapseByDepth(depth: number) {
        this.collapseStrategy = new DepthClusterStrategy(depth);
    }

    setCollapseByWard(clusterNumber = 5) {
        const graph = P.project.relation();
        this.collapseStrategy = new WardClusterStrategy(graph, clusterNumber);
    }

}
export const CC = ClusterService.singleton;
