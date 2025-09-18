export {nodeReducer};


function nodeReducer(mapping) {
    return (graph) => {
        const nodes = new Set();
        const reducedAdjacency = new Map();

        for (const [src, targets] of Object.entries(graph)) {
            const mappedSrc = mapping(src);
            nodes.add(mappedSrc);

            for (const tgt of targets) {
                const mappedTgt = mapping(tgt);
                nodes.add(mappedTgt);

                if (mappedSrc === mappedTgt) continue;
                if (!reducedAdjacency.has(mappedSrc)) {
                    reducedAdjacency.set(mappedSrc, new Set());
                }
                reducedAdjacency.get(mappedSrc).add(mappedTgt);
            }
        }
        const result = {};
        for (const node of nodes) {
            result[node] = [];
        }
        for (const [node, neighbors] of reducedAdjacency.entries()) {
            result[node] = Array.from(neighbors);
        }
        return result;
    }
}
