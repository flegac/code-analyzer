import {BaseComponent} from "/component/base.component.js";
import {GraphService} from "/service/graph.service.js"
import {CameraService} from "/service/camera.service.js"


const TEMPLATE = `
<div class="nav-wrapper">
  <h2 id="nav-title" class="nav-title">Navigation</h2>

  <section class="nav-section">
    <h3 class="nav-heading">Entrées</h3>
    <sl-menu id="nav-incoming" class="nav-menu"></sl-menu>
  </section>

  <section class="nav-section">
    <h3 class="nav-heading">Sorties</h3>
    <sl-menu id="nav-outgoing" class="nav-menu"></sl-menu>
  </section>
</div>
`;


export class NavigationComponent extends BaseComponent {
    constructor() {
        super('navigation-component', TEMPLATE);

        this.updater = () => GraphService.singleton.navigation();
        this.updateMenu();

        this.onClick = (id) => {
            const node = GraphService.singleton.nodeById[id];
            CameraService.singleton.focusOn(node);
            GraphService.singleton.select(node);
        };


        this.boundUpdate = this.updateMenu.bind(this);
        GraphService.singleton.onNavigationChange(this.boundUpdate);
    }

    updateMenu() {
        const incomingMenu = this.container.querySelector('#nav-incoming');
        const outgoingMenu = this.container.querySelector('#nav-outgoing');
        const title = this.container.querySelector('#nav-title');
        const navigation = this.updater();

        const nodeName = navigation.selected?.label || navigation.selected?.id || 'Navigation';

        title.textContent = `${nodeName}`;

        incomingMenu.innerHTML = '';
        outgoingMenu.innerHTML = '';

        navigation.incoming.forEach(item => {
            const menuItem = document.createElement('sl-menu-item');
            menuItem.value = item;
            menuItem.textContent = item;
            menuItem.addEventListener('click', () => this.onClick(item));
            incomingMenu.appendChild(menuItem);
        });

        navigation.outgoing.forEach(item => {
            const menuItem = document.createElement('sl-menu-item');
            menuItem.value = item;
            menuItem.textContent = item.split('.').slice(-2).join('.');
            menuItem.addEventListener('click', () => this.onClick(item));
            outgoingMenu.appendChild(menuItem);
        });
    }

}
