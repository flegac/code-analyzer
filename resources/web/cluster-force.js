import { PhysicsService } from "/display/physics.service.js"
import { CameraService } from "/display/camera.service.js"
import { ClusterService } from "/cluster/cluster.service.js"

export function clusterForce() {
    let nodes;

    function force(alpha) {
        try {

            const groupMap = ClusterService.singleton.collapseStrategy.computeGroupMap(nodes);

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
                        const minDist = (a.read('radius') + b.read('radius'));

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

        } catch (e) {
            console.log(`ERROR: clusterForce: ${e}`)
            throw e;
        }
    }

    force.initialize = _ => {
        nodes = _;
    };
    return force;
}