import { AttributeClusterStrategy } from "./cluster/attribute.cluster.strategy.js";
import { DepthClusterStrategy } from "./cluster/depth.cluster.strategy.js";
import { WardClusterStrategy } from "./cluster/ward.cluster.js";
import { P } from "../project/project.service.js";
export class ClusterService {
    constructor() {
        this.groupStrategy = new DepthClusterStrategy(3);
        this.collapseStrategy = new DepthClusterStrategy(5);
    }
    setGroupByDepth(depth) {
        this.groupStrategy = new DepthClusterStrategy(depth);
    }
    setGroupByLabel(label = 'group') {
        this.groupStrategy = new AttributeClusterStrategy(label);
    }
    setGroupByWard(clusterNumber = 5) {
        const graph = P.project.relation();
        this.groupStrategy = new WardClusterStrategy(graph, clusterNumber);
    }
    setCollapseByDepth(depth) {
        this.collapseStrategy = new DepthClusterStrategy(depth);
    }
    setCollapseByWard(clusterNumber = 5) {
        const graph = P.project.relation();
        this.collapseStrategy = new WardClusterStrategy(graph, clusterNumber);
    }
}
ClusterService.singleton = new ClusterService();
export const CC = ClusterService.singleton;
