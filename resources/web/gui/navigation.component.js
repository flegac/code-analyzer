import { BaseComponent } from "./core/base.component.js";
import { G } from "../display/graph.service.js";
import { CC } from "../camera.service.js";

const STYLE = `
[name=graph-navigation]{
  position: absolute;
  right:.1cm; bottom:.1cm;
  width: 12cm;
  height:7cm; margin:.1cm;
  z-index:500;
  display:flex; flex-direction:column;
  box-sizing:border-box; overflow:visible;
}

/* header */
.nav-title-row{ display:flex; flex-direction:column;  }
.nav-title-line{ display:flex; align-items:center; }
.nav-title{ margin:0; font-size:0.95rem; font-weight:600; text-decoration:underline; white-space:nowrap; }

/* breadcrumb: wraps across up to ~2–3 lines */
.nav-breadcrumb{ display:flex; flex-wrap:wrap; align-items:center; max-height:4.5rem; overflow:hidden; margin-left:.4rem; flex:1 1 auto; }

/* cards area */
.nav-cards{ display:flex;  flex:1 1 auto; min-height:0; }

/* each card */
.nav-card{ flex:1 1 0; min-width:0; display:flex; flex-direction:column; }
.nav-heading{ margin:0; padding:0; font-size:.82rem; font-weight:500; text-decoration:underline; color:var(--sl-color-gray-700); }

/* card body scrollable */
.nav-card .nav-card-body{ padding:0; box-sizing:border-box; flex:1 1 0; min-height:0; overflow:auto; }

/* tags layout */
.nav-tags{ display:flex; flex-wrap:wrap; align-items:flex-start; }
.nav-tags sl-tag{ display:inline-flex; align-items:center; font-size:.85rem; border-radius:.32rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; cursor:pointer; }


/* color variants */
.nav-tags sl-tag.incoming{ --sl-tag-background:rgba(13,110,253,0.06); --sl-tag-text-color:var(--sl-color-primary-700); }
.nav-tags sl-tag.outgoing{ --sl-tag-background:rgba(25,135,84,0.06); --sl-tag-text-color:var(--sl-color-success-700); }


/* breadcrumb tag style */
.nav-breadcrumb sl-tag{ --sl-tag-text-color:var(--sl-color-gray-900); border:1px solid rgba(0,0,0,0.06); font-weight:600; padding:.12rem .32rem; }
`;


const TEMPLATE = `
<div name="graph-navigation" class="graph-navigation panel-style">
  <div class="nav-title-row">
    <div class="nav-title-line">
      <h2 id="nav-title" class="nav-title">Navigation</h2>
      <div id="nav-breadcrumb" class="nav-breadcrumb" aria-label="Breadcrumb"></div>
    </div>
  </div>

  <div class="nav-cards">
    <div class="nav-card">
      <div class="nav-heading">Entrées</div>
      <div class="nav-card-body">
        <div id="nav-incoming-tags" class="nav-tags" aria-label="Entrées"></div>
      </div>
    </div>

    <div class="nav-card">
      <div class="nav-heading">Sorties</div>
      <div class="nav-card-body">
        <div id="nav-outgoing-tags" class="nav-tags" aria-label="Sorties"></div>
      </div>
    </div>
  </div>
</div>
`;

export class NavigationComponent extends BaseComponent {
  constructor() {
    super({
      template: TEMPLATE,
      style: STYLE
    });

    this.onClick = (id) => {
      const node = G.findNodeById(id);
      if (!node) return;
      CC.focusOn(node);
      G.select(node);
    };

    this.boundUpdate = this.updateMenu.bind(this);
    G.onSelectionChange(this.boundUpdate);

    this.updateMenu();
  }

  disconnect() {
    try { G.offSelectionChange(this.boundUpdate); } catch (e) {}
  }

  _displayLabel(fullName) {
    if (!fullName) return '';
    const afterDouble = fullName.split('::').pop();
    const parts = afterDouble.split('.');
    return parts[parts.length - 1];
  }

  _pathFromParts(originalFullName, doubleSplitIndex, segments, partIndex) {
    const doubleParts = originalFullName.split('::');
    const lastPart = doubleParts.pop();
    const prefix = doubleParts.join('::');
    const parentTail = segments.slice(0, partIndex + 1).join('.');
    const reconstructed = prefix ? `${prefix}::${parentTail}` : parentTail;
    return reconstructed;
  }

  updateMenu() {
    const incomingTags = this.container.querySelector('#nav-incoming-tags');
    const outgoingTags = this.container.querySelector('#nav-outgoing-tags');
    const breadcrumbEl = this.container.querySelector('#nav-breadcrumb');
    const titleEl = this.container.querySelector('#nav-title');

    incomingTags.innerHTML = '';
    outgoingTags.innerHTML = '';
    breadcrumbEl.innerHTML = '';
    titleEl.textContent = 'Navigation';

    const selected = G.state.selected;
    if (!selected) return;

    const incoming = selected.read('relation.in') || [];
    const outgoing = selected.read('relation.out') || [];
    const nodeName = selected.id || '';

    const doubleParts = nodeName.split('::');
    const lastDouble = doubleParts.pop();
    const prefixParts = doubleParts;
    const segments = lastDouble.split('.');

    const fullBreadcrumbParts = [];
    if (prefixParts.length) {
      fullBreadcrumbParts.push({
        label: prefixParts.join('::'),
        isPrefix: true,
        original: nodeName
      });
    }
    segments.forEach((s, i) => {
      fullBreadcrumbParts.push({
        label: s,
        index: i,
        isPrefix: false,
        original: nodeName
      });
    });

    fullBreadcrumbParts.forEach((part) => {
      const tag = document.createElement('sl-tag');
      tag.classList.add('breadcrumb-part');
      tag.textContent = part.label;
      tag.setAttribute('role', 'button');
      tag.setAttribute('tabindex', '0');

      tag.addEventListener('click', (e) => {
        e.stopPropagation();
        if (part.isPrefix) {
          const prefixName = part.label;
          const node = G.findNodeById(prefixName) || G.findNodeById(prefixParts.join('::'));
          if (node) { CC.focusOn(node); G.select(node); }
        } else {
          const parentTail = segments.slice(0, part.index + 1).join('.');
          const parentFull = prefixParts.length ? `${prefixParts.join('::')}::${parentTail}` : parentTail;
          const node = G.findNodeById(parentFull);
          if (node) { CC.focusOn(node); G.select(node); }
          else {
            const node2 = G.findNodeById(parentTail);
            if (node2) { CC.focusOn(node2); G.select(node2); }
          }
        }
      });

      tag.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          tag.click();
        }
      });

      breadcrumbEl.appendChild(tag);
    });

    const makeTag = (fullName, type) => {
      const tag = document.createElement('sl-tag');
      tag.textContent = this._displayLabel(fullName);
      tag.setAttribute('aria-label', fullName);
      tag.setAttribute('role', 'button');
      tag.setAttribute('tabindex', '0');

      if (type === 'incoming') tag.classList.add('incoming');
      else tag.classList.add('outgoing');

      tag.addEventListener('click', (e) => {
        e.stopPropagation();
        this.onClick(fullName);
      });
      tag.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.onClick(fullName);
        }
      });
      return tag;
    };

    incoming.forEach(item => {
      incomingTags.appendChild(makeTag(item, 'incoming'));
    });
    outgoing.forEach(item => {
      outgoingTags.appendChild(makeTag(item, 'outgoing'));
    });
  }
}
