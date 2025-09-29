
export const STYLE = `
.graph-filter {
  position: absolute;
  width: 300px;
  height: 100%;
}
`;

export const TEMPLATE = `
<div name="graph-filter" class="graph-filter panel-style">
  <div class="section-header">
     <sl-switch v-model="isActive" @sl-change="apply" checked disabled></sl-switch>
    <h3>Filter</h3>
  </div>

  <div class="slider-row">
    <label>By depth</label>
    <sl-range v-model="state.hierarchyPruneLevel" min="1" max="10" step="1" value="1" @sl-change="applyPruning"></sl-range>
  </div>

  <div class="slider-row">
    <label>Search</label>
    <sl-input v-model="nodeName" @sl-input="apply" disabled></sl-input>
  </div>

  <div name="nodes"></div>
</div>
`;