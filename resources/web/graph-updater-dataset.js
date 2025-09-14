class GraphUpdaterDataset {
    constructor(updater) {
        this.updater = updater
    }

    async apply(graph = null) {
        const hierarchy = await this.hierarchy();
        this.updater.tree.rebuild(hierarchy);
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
        const excluded = config.excluded;


        const exactExcludes = excluded.filter(e => !e.endsWith('.*'));
        const prefixExcludes = excluded
            .filter(e => e.endsWith('.*'))
            .map(e => e.slice(0, -2)); // retirer le ".*"

        function isExcluded(id) {
            if (exactExcludes.includes(id)) return true;
            return prefixExcludes.some(prefix => id.startsWith(prefix));
        }

        const filtered = Object.fromEntries(
            Object.entries(raw)
                .filter(([key]) => !isExcluded(key))
                .map(([key, values]) => [key, values.filter(v => !isExcluded(v))])
        );

        return new Relation('dependencies', filtered);
    }

    async hierarchy() {
        const graph = await this.dependencies();
        const nodes = graph.nodes;

        const hierarchy = {};

        for (const full of nodes) {
            const [prefix, suffix] = full.split("::");
            const parts = prefix ? prefix.split(".") : [];

            for (let i = 1; i < parts.length; i++) {
                const parent = parts.slice(0, i).join(".");
                const child = parts.slice(0, i + 1).join(".");

                if (!hierarchy[parent]) {
                    hierarchy[parent] = [];
                }
                if (!hierarchy[parent].includes(child)) {
                    hierarchy[parent].push(child);
                }
            }

            if (suffix) {
                let a = null;
                let b = null;
                [a, b] = suffix.split("/");

                if (a !== null) {
                    const base = parts.join(".");
                    const className = [base, a].join('::');
                    if (!hierarchy[base]) {
                        hierarchy[base] = [];
                    }
                    hierarchy[base].push(className);
                    if (b != null) {
                        const methodName = [className, b].join('/');
                        if (!hierarchy[className]) {
                            hierarchy[className] = [];
                        }
                        hierarchy[className].push(methodName);
                    }
                }
            }


        }
        // const raw = await fetch(this.params.hierarchyPath).then(res => res.json());
        return new Relation('hierarchy', hierarchy);
    }

    async moduleInfos() {
        return await fetch(this.params().moduleInfosPath).then(res => res.json());
    }
}