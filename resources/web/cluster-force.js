import {PhysicsService} from "/display/physics.service.js";
import {CameraService} from "/display/camera.service.js";

export function clusterForce() {
    let nodes;

    function force(alpha) {
        const groupMap = PhysicsService.singleton.getClusterMap(nodes);

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
                    const minDist = (a.radius + b.radius);

                    let shift = alpha / n * ((minDist - dist) / Math.max(dist, minDist));

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

        if (PhysicsService.singleton.state.camAutoFit) {
            CameraService.singleton.zoomToFit()
        }

    }

    force.initialize = _ => {
        nodes = _;
    };
    return force;
}