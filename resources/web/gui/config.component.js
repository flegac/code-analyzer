import {BaseComponent} from "./core/base.component.js";
import {V} from "../display/visual.service.js";

const STYLE = `
  .graph-filter {
    position: absolute;
    width: 300px;
    height: 100%;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(2px);
    z-index: 1000;
    box-shadow: var(--sl-shadow-large);
    border-radius: var(--sl-border-radius-medium);
    display: flex;
    flex-direction: column;
    overflow: auto;
  }

  .group-block {
    border: 1px solid var(--sl-color-neutral-200);
    border-radius: 6px;
    padding: 0.5em;
  }

  .group-block h4 {
    margin: 0 0 0.5em 0;
  }

  .group-list {
    display: flex;
    flex-direction: column;
    gap: 0.25em;
  }

  .switch-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  sl-tag {
    margin-right: 0.25em;
    margin-bottom: 0.25em;
  }
`;

const TEMPLATE = `
  <div class="graph-filter">
    <div class="group-block">
      <h4>Selected</h4>
      <div class="group-list" id="selected-list"></div>
    </div>

    <div class="group-block">
      <h4>Excluded</h4>
      <div class="group-list" id="excluded-list"></div>
    </div>

    <div class="group-block">
      <h4>Groups</h4>
      <div id="group-container"></div>
    </div>
  </div>
`;

export class ConfigComponent extends BaseComponent {
  constructor() {
    super({
      template: TEMPLATE,
      style: STYLE,
    });
  }

  rebuild(data) {
    const selected = new Set(data.selected);
    const excluded = new Set(data.excluded);
    const groups = data.groups;
    const onChange = () => V.apply();

    // Clear previous content
    this.container.querySelector('#selected-list').innerHTML = '';
    this.container.querySelector('#excluded-list').innerHTML = '';
    this.container.querySelector('#group-container').innerHTML = '';

    // Selected
    const selectedList = this.container.querySelector('#selected-list');
    selected.forEach(item => {
      const row = document.createElement('div');
      row.className = 'switch-row';
      const tag = document.createElement('sl-tag');
      tag.textContent = item;
      row.appendChild(tag);

      const toggle = document.createElement('sl-switch');
      toggle.checked = true;
      toggle.addEventListener('sl-change', e => {
        if (!e.target.checked) selected.delete(item);
        else selected.add(item);
        onChange();
      });
      row.appendChild(toggle);
      selectedList.appendChild(row);
    });

    // Excluded
    const excludedList = this.container.querySelector('#excluded-list');
    excluded.forEach(item => {
      const row = document.createElement('div');
      row.className = 'switch-row';
      const tag = document.createElement('sl-tag');
      tag.textContent = item;
      row.appendChild(tag);

      const toggle = document.createElement('sl-switch');
      toggle.checked = true;
      toggle.addEventListener('sl-change', e => {
        if (!e.target.checked) excluded.delete(item);
        else excluded.add(item);
        onChange();
      });
      row.appendChild(toggle);
      excludedList.appendChild(row);
    });

    // Groups
    const groupContainer = this.container.querySelector('#group-container');
    Object.entries(groups).forEach(([groupName, patterns]) => {
      const block = document.createElement('div');
      block.className = 'group-block';
      block.innerHTML = `<h4>${groupName}</h4>`;
      const list = document.createElement('div');
      list.className = 'group-list';

      const tagContainer = document.createElement('div');
      tagContainer.style.display = 'flex';
      tagContainer.style.flexWrap = 'wrap';

      patterns.forEach(p => {
        const tag = document.createElement('sl-tag');
        tag.textContent = p;
        tagContainer.appendChild(tag);
      });

      list.appendChild(tagContainer);
      block.appendChild(list);
      groupContainer.appendChild(block);
    });
  }
}
