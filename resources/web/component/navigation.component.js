import {BaseComponent} from "/component/base.component.js";
import {GraphService} from "/service/graph.service.js"
import {LayoutService} from "/service/layout.service.js"
import {CameraService} from "/service/camera.service.js"


const TEMPLATE = `
<div>
  <div id="nav-title">Navigation</div>
  <div>
    <div>Incoming</div>
    <sl-menu id="nav-incoming"></sl-menu>
  </div>
  <div>
    <div>Outgoing</div>
    <sl-menu id="nav-outgoing"></sl-menu>
  </div>
</div>
`;

export class NavigationComponent extends BaseComponent {
    constructor() {
        super('navigation-component', TEMPLATE);

        this.updater = () => GraphService.singleton.navigation();
        this.updateMenu();

        this.onClick = (id) => {
            const node = LayoutService.singleton.graph.nodeById[id];
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

        title.textContent = `🧭 ${nodeName}`;

        incomingMenu.innerHTML = '';
        outgoingMenu.innerHTML = '';

        navigation.incoming.forEach(item => {
            const menuItem = document.createElement('sl-menu-item');
            menuItem.value = item.value || item;
            menuItem.textContent = item.label || item;
            menuItem.addEventListener('click', () => this.onClick(item));
            incomingMenu.appendChild(menuItem);
        });

        navigation.outgoing.forEach(item => {
            const menuItem = document.createElement('sl-menu-item');
            menuItem.value = item.value || item;
            menuItem.textContent = item.label || item;
            menuItem.addEventListener('click', () => this.onClick(item));
            outgoingMenu.appendChild(menuItem);
        });
    }


    startAutoRefresh() {
        this.refreshInterval = setInterval(() => {
            this.updateMenu();
        }, 1000); // rafraîchit toutes les secondes
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        clearInterval(this.refreshInterval); // nettoyage si le composant est retiré
    }
}
