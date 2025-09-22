export class Injector {

    static injectAll(style, links = [], scripts = []) {
        if (style !== null) {
            Injector.injectStyle(style);
        }
        links.forEach(link => {
            Injector.injectLink(link);
        })
        scripts.forEach(script => {
            Injector.injectScript(script);
        })
    }

    static injectScript({src, type = null}) {
        const hash = Injector.hash(src);
        const existing = document.head.querySelector(`script[my-hash-id="${hash}"]`);
        if (!existing) {
            console.log(`loading <script>: ${src}`);
            const elt = document.createElement('script');
            elt.setAttribute('my-hash-id', hash);
            elt.src = src;
            if (type) {
                elt.type = type;
            }
            document.head.appendChild(elt);
        }
    }

    static injectLink(href) {
        const hash = Injector.hash(href);
        const existing = document.head.querySelector(`link[my-hash-id="${hash}"]`);
        if (!existing) {
            console.log(`loading <link>: ${href}`);
            const elt = document.createElement('link');
            elt.setAttribute('my-hash-id', hash);
            elt.href = href;
            document.head.appendChild(elt);
        }
    }

    static injectStyle(styleText) {
        const hash = Injector.hash(styleText);
        const existing = document.head.querySelector(`style[my-hash="${hash}"]`);
        if (!existing) {
            console.log(`loading <style> [...]`);
            const elt = document.createElement('style');
            elt.textContent = styleText;
            elt.setAttribute('my-hash-id', hash);
            document.head.appendChild(elt);
        }
    }

    static hash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash |= 0;
        }
        return `style-${Math.abs(hash)}`;
    }

}