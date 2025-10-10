import { MyNode } from "../../visuals/graph.service";

export const Fixer = {
    soft: (node: MyNode, current: number, target: number, strength: number) => {
        const delta = target - current;
        const factor = strength * delta / current;
        node.x += node.x * factor;
        node.y += node.y * factor;
        node.z += node.z * factor;
    },

    hard: (node: MyNode, current: number, target: number, strength: number) => {
        const scale = target / current;
        node.x *= scale;
        node.y *= scale;
        node.z *= scale;
    }
};

const DEFAULT_OPTIONS = {
    R: [1000],
    power: 1.,
    fixer: Fixer.soft
};

export function sphericalConstraint(options = {}) {
    const { R, power, fixer } = { ...DEFAULT_OPTIONS, ...options };

    let nodes: MyNode[];
    let assignedRadii: number[];

    function force(alpha: number) {
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];

            const radius = Math.hypot(node.x, node.y, node.z);
            if (radius === 0) {
                node.x = Math.random();
                node.y = Math.random();
                node.z = Math.random();
                continue;
            }

            const targetRadius = assignedRadii[i];

            fixer(node, radius, targetRadius, power * alpha);
        }
    }

    force.initialize = (inputNodes: MyNode[]) => {
        nodes = inputNodes;
        assignedRadii = assignRadii(nodes, R);
    };

    return force;
}

function assignRadii(nodes: MyNode[], R: number[]) {
    // const values = nodes.map(n => Math.hypot(n.x, n.y, n.z));
    // const values = nodes.map(n => n.read('relation.in').length + n.read('relation.out').length);
    const values = nodes.map(n => n.read('relation.in').length);
    // const values = nodes.map(n => n.read('relation.out').length);

    const sortedIndices = values
        .map((d, i) => ({ index: i, value: d }))
        .sort((a, b) => b.value - a.value)
        .map(obj => obj.index);

    // 🧠 Calcul des surfaces sphériques (4πr², mais on ignore 4π car c’est constant)
    const surfaces = R.map(r => r);
    const totalSurface = surfaces.reduce((sum, s) => sum + s, 0);

    // 📊 Calcul du nombre de sommets par couche selon le ratio de surface
    const layerCounts = surfaces.map(s => Math.round((s / totalSurface) * nodes.length));

    // 🔁 Ajustement pour que la somme soit exactement égale à nodes.length
    let totalAssigned = layerCounts.reduce((sum, c) => sum + c, 0);
    while (totalAssigned !== nodes.length) {
        const delta = nodes.length - totalAssigned;
        const index = surfaces.indexOf(Math.max(...surfaces));
        layerCounts[index] += delta;
        totalAssigned = layerCounts.reduce((sum, c) => sum + c, 0);
    }

    // 🎯 Assignation des rayons selon les indices triés
    const radii = new Array(nodes.length);
    let current = 0;
    for (let layerIndex = 0; layerIndex < R.length; layerIndex++) {
        const count = layerCounts[layerIndex];
        const radius = R[layerIndex];
        for (let i = 0; i < count && current < sortedIndices.length; i++, current++) {
            const nodeIndex = sortedIndices[current];
            radii[nodeIndex] = radius;
        }
    }

    return radii;
}
