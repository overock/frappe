export default class SVG {
    static get namespace() {
        return 'http://www.w3.org/2000/svg';
    }

    static create(el, html, attr) {
        const svg = document.createElementNS(this.namespace, el);

        switch(true) {
        case typeof html == 'string':
            svg.innerHTML = html;
            break;

        case html instanceof SVGElement:
            svg.appendChild(html);
            break;

        case html instanceof Array:
            html.forEach(v => {
                typeof v == 'string' && (svg.innerHTML += v);
                v instanceof SVGElement && svg.appendChild(v);
            });
            break;
        }

        typeof attr == 'object' && Object.keys(attr).forEach(k => svg.setAttribute(k, attr[k]));
        
        return svg;
    }
    
    static build(html) {
        container.innerHTML = html;
        const ret = container.firstElementChild;
        container.removeChild(ret);
        return ret;
    }

    static get marker() {
        return this.create('defs', `
            <marker id="dest" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="8" markerHeight="8" orient="auto">
                <path  class="frappe-flow-marker" d="m 0 0 L 8 4 L 0 8 z" />
            </marker>
        `);
    }

    static get actionHandle() {
        return this.build(`
            <symbol id="actionMoveTo" viewBox="-4 -4 72 72">
                <rect class="frappe-handle-bevel" x="4" y="4" width="56" height="56" rx="10" ry="10" />
                <rect class="frappe-handle-symbol" x="0" y="0" width="64" height="64" rx="12" ry="12" />
            </symbol>
        `);
    }

    static get actionRemove() {
        return this.build(`
            <symbol id="actionRemove" viewBox="0 0 20 20">
                <circle class="frappe-handle-remove" cx="10" cy="10" r="9" />
                <path class="frappe-handle-remove" d="M6,6 l8,8 M6,14 l8,-8" />
            </symbol>
        `);
    }

    static get flowHandle() {
        return this.build(`
            <symbol id="flowSnapTo" viewBox="0 0 16 16">
                <circle class="frappe-handle-joint" cx="8" cy="8" r="7" />
                <path class="frappe-handle-joint" d="M4,8 l8,0 M8,4 l0,8" />
            </symbol>
        `);
    }
}

const container = SVG.create('svg');