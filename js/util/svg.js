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
                <path d="m 0 0 L 8 4 L 0 8 z" />
            </marker>
        `);
    }

    static get actionHandle() {
        return this.build(`
            <symbol id="actionMoveTo" viewBox="-4 -4 72 72">
                <rect class="frappe-handle-bevel" x="2" y="2" width="60" height="60" rx="12" ry="12" />
                <rect class="frappe-handle-symbol" x="0" y="0" width="64" height="64" rx="12" ry="12" />
            </symbol>
        `);
    }

    static get flowHandle() {
        return this.build(`
            <symbol id="flowSnapTo" viewBox="0 0 16 16">
                <circle class="frappe-handle-joint" cx="8" cy="8" r="7" />
                <circle class="frappe-handle-joint frappe-handle-joint-deco" cx="8" cy="8" r="6" fill="#000" />
                <path class="frappe-handle-joint" d="M4, 8 l8, 0 M8, 4 l0, 8" stroke="#fff"/>
            </symbol>
        `);
    }
}

const container = SVG.create('svg');