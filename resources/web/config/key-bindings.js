export function keyBindings(app) {
    const cam = app.layout.cam;

    return {
        'q': () => cam.rotateY(-cam.rotationSpeed),
        'arrowleft': () => this.rotateY(-cam.rotationSpeed),
        'd': () => cam.rotateY(cam.rotationSpeed),
        'arrowright': () => cam.rotateY(cam.rotationSpeed),

        'z': () => cam.rotateX(-cam.rotationSpeed),
        'arrowup': () => cam.rotateX(-cam.rotationSpeed),
        's': () => cam.rotateX(cam.rotationSpeed),
        'arrowdown': () => cam.rotateX(cam.rotationSpeed),

        'a': () => cam.rotateZ(cam.rotationSpeed),
        'e': () => cam.rotateZ(-cam.rotationSpeed),

        'w': () => cam.alignUpToAxis('x'),
        'x': () => cam.alignUpToAxis('y'),
        'c': () => cam.alignUpToAxis('z'),
    }
}
