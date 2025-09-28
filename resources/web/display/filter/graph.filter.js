export class GraphFilter {
  static GROUP_REF = '@';
  static WILDCARD = '*';
  static SEPARATOR = '.';

  /**
   * @param {Object|null} config  Même format que pour GraphFilter (groups, selected, excluded) ou null pour bypass.
   * @param {Iterable<string>|null} forbiddenNodes  Liste/Set de noms de noeuds à supprimer absolument.
   */
  constructor(config, forbiddenNodes = null) {
    this.config = config === undefined ? null : config;
    this.forbidden = new Set(forbiddenNodes ?? []);
    // prepare matchers (null = passthrough)
    if (this.config !== null) {
      this.matchSelected = this._prepare(this.config.selected) ?? (id => true);
      this.matchExcluded = this._prepare(this.config.excluded) ?? (id => false);
    } else {
      this.matchSelected = id => true;
      this.matchExcluded = id => false;
    }
  }

  /**
   * Applique le filtre au graphe.
   * - supprime les sommets interdits (clefs)
   * - supprime dans les listes d'adjacence toute référence vers un sommet interdit
   * - applique les règles selected/excluded existantes
   *
   * @param {Object} graph  map: nodeId -> Array<nodeId>
   * @returns {Object} nouveau graphe filtré
   */
  apply(graph) {
    if (this.config === null && this.forbidden.size === 0) {
      return graph;
    }

    return Object.fromEntries(
      Object.entries(graph)
        // retirer les clés interdites
        .filter(([key]) => !this._isForbidden(key))
        // appliquer accept() sur les sommets conservés (clé)
        .filter(([key]) => this.accept(key))
        // pour chaque sommet restant, garder uniquement les voisins acceptés et non interdits
        .map(([key, neighbors]) => [
          key,
          (Array.isArray(neighbors) ? neighbors : [])
            .filter(v => !this._isForbidden(v) && this.accept(v))
        ])
    );
  }

  /**
   * Retourne true si un item est accepté selon selected/excluded et forbidden.
   * Important : forbidden est prioritaire (si node est forbidden -> false).
   */
  accept(item) {
    if (this._isForbidden(item)) return false;
    if (this.matchSelected !== null) {
      if (!this.matchSelected(item)) return false;
    }
    return !this.matchExcluded(item);
  }

  /**
   * Met à jour la liste des forbidden nodes (remplace complètement).
   * Accepte Array ou Set.
   */
  setForbidden(iterable) {
    this.forbidden = new Set(iterable ?? []);
  }

  /**
   * Ajoute un seul node à la liste forbidden.
   */
  addForbidden(node) {
    this.forbidden.add(node);
  }

  /**
   * Retire un node de la liste forbidden.
   */
  removeForbidden(node) {
    this.forbidden.delete(node);
  }

  _isForbidden(item) {
    return this.forbidden.has(item);
  }

  _prepare(group) {
    if (group === null || group === undefined || group.length === 0) return null;
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
      const refGroup = this.config && this.config.groups ? this.config.groups[refName] : null;
      if (!refGroup) return [];
      visited.add(refName);
      return this._expand(refGroup, visited);
    });
  }
}

/* ---------- utilitaires (réutilisés) ---------- */

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
