

class GraphFilter {
    static GROUP_REF = '@';
    static WILDCARD = '*';
    static SEPARATOR = '.';
    constructor(config) {
        this.config = config;
        this.groups = config.groups;
        this.matchSelected = this._prepare(config.selected);
        this.matchExcluded = this._prepare(config.excluded);
    }

    apply(graph) {
        return Object.fromEntries(
            Object.entries(graph)
                .filter(([key]) => this.accept(key))
                .map(([key, values]) => [key, values.filter(v => this.accept(v))])
        );
    }

    accept(item) {
        if (this.matchSelected !== null) {
            if (!this.matchSelected(item)) {
                return false
            }
        }
        return !this.matchExcluded(item)
    }

    _prepare(group) {
        if (group === null || group.length === 0) return null;
        return createMatcher(this._expand(group), GraphFilter.WILDCARD);
    }

    _expand(group, visited = new Set()) {
        return group.flatMap(item => {
            if (typeof item !== 'string') {
                console.warn(`Unsupported item: ${item}`);
                return [];
            }
            if (!item.startsWith(GraphFilter.GROUP_REF)) {
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

}


function compilePatterns(patterns, wildcard) {
    return patterns.map(p => {
        const escaped = p.split(wildcard).map(s =>
            s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        ).join('.*');
        return new RegExp('^' + escaped + '$');
    });
}

function createMatcher(patterns, wildcard) {
    const regexList = compilePatterns(patterns, wildcard);
    return str => regexList.some(rx => rx.test(str));
}
