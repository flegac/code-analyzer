const WILDCARD = '*';
const GROUP_REF = '@';

class GraphFilter {
    constructor(config) {
        this.config = config;
        this.groups = config.groups;
        this.selected = this._prepare(config.selected);
        this.excluded = this._prepare(config.excluded);
    }

    apply(graph) {
        return Object.fromEntries(
            Object.entries(graph)
                .filter(([key]) => this.accept(key))
                .map(([key, values]) => [key, values.filter(v => this.accept(v))])
        );
    }

    accept(item) {
        if (this.selected !== null) {
            if (!this._match(item, this.selected)) {
                return false
            }
        }
        return !this._match(item, this.excluded)
    }

    _match(item, rules) {
        return rules.exact.includes(item)
            || rules.prefix.some(prefix => item.startsWith(prefix))
            || rules.suffix.some(prefix => item.endsWith(prefix))
    }

    _expand(group, visited = new Set()) {
        return group.flatMap(item => {
            if (typeof item !== 'string') {
                console.warn(`Unsupported item: ${item}`);
                return [];
            }
            if (!item.startsWith(GROUP_REF)) {
                return [item];
            }

            const refName = item.slice(1);
            if (visited.has(refName)) {
                console.warn(`Référence circulaire détectée : ${item}`);
                return [];
            }
            const refGroup = this.groups[refName];
            if (!refGroup) return [];
            visited.add(refName);
            return this._expand(refGroup, visited);
        });
    }

    _prepare(group) {
        if (group === null || group.length === 0) return null;
        const gg = this._expand(group);
        return {
            exact: gg
                .filter(e => !e.includes(WILDCARD)),
            prefix: gg
                .filter(e => e.endsWith(WILDCARD))
                .map(e => e.slice(0, -1)),
            suffix: gg
                .filter(e => e.startsWith(WILDCARD))
                .map(e => e.slice(0, -1)),
        }
    }
}