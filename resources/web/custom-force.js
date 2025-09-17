function forceGroupCollide(state) {
    let nodes;
    const dimension = state.physics.dimension;
    const strategy = new GroupStrategy(state.physics.collapsingDepth);

    function force(alpha) {
        if (dimension < 3) {
            return;
        }
        const groupMap = strategy.computeGroupMap(nodes);

        for (const groupNodes of groupMap.values()) {
            const n = groupNodes.length;
            for (let i = 0; i < n; i++) {
                for (let j = i + 1; j < n; j++) {
                    const a = groupNodes[i];
                    const b = groupNodes[j];
                    const dx = b.x - a.x;
                    const dy = b.y - a.y;
                    const dz = b.z - a.z;
                    const dist = Math.hypot(dx, dy, dz);
                    const minDist = 1. + (a.radius + b.radius);

                    let shift = ((minDist - dist) / Math.max(dist, minDist));
                    shift *= alpha / n;

                    const sx = dx * shift, sy = dy * shift, sz = dz * shift;
                    b.x += sx;
                    b.y += sy;
                    b.z += sz;
                    a.x -= sx;
                    a.y -= sy;
                    a.z -= sz;
                }
            }
        }
    }

    force.initialize = _ => {
        nodes = _;
    };
    return force;
}