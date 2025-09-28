export function sphericalConstraint(R = 2000, power = 1.) {
    let nodes;

    function force(alpha) {
        for (const node of nodes) {
            const dx = node.x;
            const dy = node.y;
            const dz = node.z;

            const dist = Math.hypot(dx, dy, dz);
            if (dist === 0) {
                node.x = Math.random();
                node.y = Math.random();
                node.z = Math.random();
                continue
            }

            const desiredDist = R;
            const delta = desiredDist - dist;
            const strength = alpha * power * delta / dist;

            node.x += dx * strength;
            node.y += dy * strength;
            node.z += dz * strength;
        }
    }

    force.initialize = inputNodes => {
        nodes = inputNodes;
    };

    return force;
}
