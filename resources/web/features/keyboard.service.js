export class KeyboardService {
    static singleton = new KeyboardService();

    constructor() {
        this.handlers = new Map();
        this.keysPressed = new Set();
        $(document).on('keydown', e => {
            this.keysPressed.add(e.key.toLowerCase());
        });
        $(document).on('keyup', e => {
            this.keysPressed.delete(e.key.toLowerCase());
        });
        this.start();
        console.log('initialize', this);
    }

    onStart(callback) {
        return this.register('__before__', callback);
    }

    onStop(callback) {
        return this.register('__after__', callback);
    }

    register(key, callback) {
        this.handlers.set(key.toLowerCase(), callback);
        return this;
    }

    registerMap(mapping) {
        Object.entries(mapping).forEach(([key, value]) => this.register(key, value))
        return this;
    }

    start() {
        if (this._listening) return;
        this._listening = true;
        this._listen();
    }

    _listen() {
        const onStart = this.handlers.get('__before__');
        const onStop = this.handlers.get('__after__');
        if (onStart) {
            onStart();
        }
        this.handlers.forEach((callback, key) => {
            try {
                if (callback !== null && this.keysPressed.has(key.toLowerCase())) {
                    callback();
                }
            } catch (e) {
                console.error(`error in Events.listen() : ${e}`)
            }
        })

        if (onStop) {
            onStop();
        }
        requestAnimationFrame(() => this._listen());
    }
}
