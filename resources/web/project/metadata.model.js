export class Metadata {
    constructor() {
        this._data = {
            // key => itemId => value
        }
    }

    labels() {
        return [...Object.keys(this._data)];
    }

    write(key, id, value) {
        this._data ??= {};
        this._data[key] ??= {};
        this._data[key][id] = value;
    }

    read(key, id) {
        return this._data?.[key]?.[id] ?? null;
    }

    readAll(id) {
        const result = {};
        if (!this._data) return result;

        for (const key of Object.keys(this._data)) {
            result[key] = this.read(key, id);
        }

        return result;
    }

}