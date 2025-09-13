function forceGroupCollide(groupFn, groupDistance = 1) {
    let nodes;
    const strength = 1.;
    const baseDistance = groupDistance;

    function force(alpha) {

        const groupMap = new Map();
        for (const node of nodes) {
            const group = groupFn(node);
            if (!groupMap.has(group)) groupMap.set(group, []);
            groupMap.get(group).push(node);
        }

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
                    const minDist = 2.5 * baseDistance + (a.radius + b.radius);
                    const maxDist = 5. * baseDistance + (a.radius + b.radius);

                    let shift = .0;
                    if (dist > maxDist) {

                    } else if (dist < maxDist) {
                        shift = -((maxDist - dist) / maxDist);
                    } else {
                        shift = ((minDist - dist) / minDist);
                    }
                    shift *= alpha * strength / n;

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