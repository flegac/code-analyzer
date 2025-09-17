export class GraphTransformer {
    constructor(strategy) {
        this.strategy = strategy;
    }

    apply(graph) {
        const transformed = {};

        for (const [key, targets] of Object.entries(graph)) {
            const newKey = this.strategy(key);
            if (!transformed[newKey]) transformed[newKey] = [];

            for (const target of targets) {
                const newTarget = this.strategy(target);
                transformed[newKey].push(newTarget);
            }
        }

        for (const key in transformed) {
            transformed[key] = [...new Set(transformed[key])];
        }

        return transformed;
    }
}