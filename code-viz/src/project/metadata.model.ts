import { FeatureMaps } from "./project.service";

export class Metadata {
    private _data: FeatureMaps;
    constructor() {
        this._data = {
            // key => itemId => value
        }
    }

    labels() {
        return [...Object.keys(this._data)];
    }

    write(key: string, id: string, value: any) {
        this._data ??= {};
        this._data[key] ??= {};
        this._data[key][id] = value;
    }

    read(key: string, id: string) {
        return this._data?.[key]?.[id] ?? null;
    }

    readAll(id: string) {
        const result: FeatureMaps = {};
        if (!this._data) return result;

        for (const key of Object.keys(this._data)) {
            result[key] = this.read(key, id);
        }

        return result;
    }

}