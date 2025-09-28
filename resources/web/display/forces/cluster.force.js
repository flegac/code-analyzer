import {CC} from "../cluster.service.js";

export function clusterForce() {
    let nodes;

    function force(alpha) {
        try {
            const groupMap = CC.collapseStrategy.computeGroupMap(nodes);
            for (const group of groupMap.values()) {
                applyGroupForces(group, alpha);
            }
        } catch (error) {
            console.error("clusterForce error:", error);
            throw error;
        }
    }

    force.initialize = inputNodes => {
        nodes = inputNodes;
    };

    return force;
}

function applyGroupForces(group, alpha) {
    const pairs = getNodePairs(group);
    const n = group.length;
    // const pairs = getNodePairsFast(group);

    const count = pairs.length;
    for (const [a, b] of pairs) {
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dz = b.z - a.z;
        const dist = Math.hypot(dx, dy, dz);
        const minDist = a.read("radius") + b.read("radius");

        const shift = alpha / n * ((minDist - dist) / Math.max(dist, minDist));

        const sx = dx * shift;
        const sy = dy * shift;
        const sz = dz * shift;

        b.x += sx;
        b.y += sy;
        b.z += sz;
        a.x -= sx;
        a.y -= sy;
        a.z -= sz;
    }
}

function getNodePairs(group) {
    const pairs = [];
    const count = group.length;

    for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) {
            pairs.push([group[i], group[j]]);
        }
    }

    return pairs;
}

function buildKDTree(points, depth = 0) {
    if (points.length === 0) return null;

    const k = 3; // dimensions: x, y, z
    const axis = depth % k;

    points.sort((a, b) => a[axis] - b[axis]);
    const median = Math.floor(points.length / 2);

    return {
        point: points[median],
        left: buildKDTree(points.slice(0, median), depth + 1),
        right: buildKDTree(points.slice(median + 1), depth + 1),
        axis
    };
}

function distanceSq(a, b) {
    const dx = a[0] - b[0], dy = a[1] - b[1], dz = a[2] - b[2];
    return dx * dx + dy * dy + dz * dz;
}

function knnSearch(tree, target, k, heap = []) {
    if (!tree) return;

    const dist = distanceSq(tree.point, target);
    heap.push({point: tree.point, dist});
    heap.sort((a, b) => a.dist - b.dist);
    if (heap.length > k) heap.pop();

    const axis = tree.axis;
    const diff = target[axis] - tree.point[axis];
    const [near, far] = diff < 0 ? [tree.left, tree.right] : [tree.right, tree.left];

    knnSearch(near, target, k, heap);
    if (heap.length < k || diff * diff < heap[heap.length - 1].dist) {
        knnSearch(far, target, k, heap);
    }

    return heap.map(h => h.point);
}

function getNodePairsFast(group, k = 5) {
    const points = group.map(n => [n.x, n.y, n.z]);
    const tree = buildKDTree(points);
    const pairs = new Set();

    for (let i = 0; i < points.length; i++) {
        const target = points[i];
        const neighbors = knnSearch(tree, target, k + 1) // +1 pour inclure le point lui-même
            .filter(p => p !== target);

        for (const p of neighbors) {
            const j = points.findIndex(pt => pt === p);
            const key = i < j ? `${i},${j}` : `${j},${i}`;
            pairs.add(key);
        }
    }

    return Array.from(pairs).map(key => {
        const [i, j] = key.split(',').map(Number);
        return [group[i], group[j]];
    });
}
