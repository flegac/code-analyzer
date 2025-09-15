class GraphUpdaterDataset {
    constructor(updater) {
        this.updater = updater
    }

    async apply() {
        const dependencies = await this.dependencies()
        this.updater.tree.rebuild(dependencies.hierarchy());
    }

    params() {
        return this.updater.params.dataset
    }

    async loadConfig() {
        return await fetch(this.params().configPath).then(res => res.json());
    }

    async dependencies() {
        if (this.params().dataset === null) {
            this.params().dataset = await fetch(this.params().datasetPath).then(res => res.json());
            console.log(`loading from ${this.params().datasetPath}`);
        }
        let raw = this.params().dataset;
        const config = await this.loadConfig();
        const filtered = new GraphFilter(config).apply(raw);
        return new Relation('dependencies', filtered);
    }

    async moduleInfos() {
        return await fetch(this.params().moduleInfosPath).then(res => res.json());
    }
}
