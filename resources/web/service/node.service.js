export class NodeService {
    static singleton = new NodeService()

    constructor() {
        this.nodeMap = {};
    }


    read(name, nodeId) {
        return this.nodeMap.name[nodeId];
    }

    write(name, nodeId, value) {
        this.nodeMap.name[nodeId] = value;
    }

    readMap(name) {
        return this.nodeMap.name;
    }


    writeMap(name, values) {
        this.nodeMap.name = values;
    }

}