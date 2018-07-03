const container = document.createElement('div');

export default class SVG {
  static get namespace() {
    return 'http://www.w3.org/2000/svg';
  }

  static create(el, html, attr) {
    const svg = document.createElementNS(this.namespace, el);

    switch(true) {
      case typeof html == 'string':
        container.innerHTML = `<svg>${html}</svg>`;

        let node = container.firstElementChild.firstElementChild;

        while(node) {
          svg.appendChild(node.cloneNode(true));
          node = node.nextSibling;
        }
        
        // IE does not support SVGElement.innerHTML
        //svg.innerHTML = html;
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

  static build(markup) {
    container.innerHTML = `<svg>${markup}</svg>`;
    return container.firstElementChild.firstElementChild;
  }

  static get marker() {
    return this.build(`
      <marker id="dest" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="8" markerHeight="8" orient="auto">
        <path class="frappe-flow-marker" d="M0,0 L8,4 L0,8 z" />
      </marker>
    `);
  }

  static get ascension() {
    return this.build(`
      <symbol id="ascension" viewBox="0 0 8 8">
        <path d="M1,7 L4,1 L7,7 z" />
      </symbol>
    `);
  }

  static get descension() {
    return this.build(`
      <symbol id="descension" viewBox="0 0 8 8">
        <path d="M1,1 L4,7 L7,1 z" />
      </symbol>
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

  static get normMatrix() { // #ff0000 / #6da8e4
    return this.build(`
      <filter id="actionNormal" color-interpolation-filters="sRGB">
        <feColorMatrix in="SourceGraphic" type="matrix"
          values="1    0.43 0 0 0
                  0.95 0.66 0 0 0
                  0    0.89 0 0 0
                  0    0    0 1 0" />
      </filter>
    `);
  }

  static get radialMatrix() {
    return this.build(`
      <filter id="actionRadial" color-interpolation-filters="sRGB">
        <feColorMatrix in="SourceGraphic" type="matrix"
        values="1    0.43 0 0   0
                0.95 0.66 0 0   0
                0    0.89 0 0   0
                0    0    0 0.8 0" />
      </filter>
  `);
  }

  static get warnMatrix() {
    return this.build(`
      <filter id="actionWarning" color-interpolation-filters="sRGB">
        <feColorMatrix in="SourceGraphic" type="matrix"
          values="1 0.92 0 0 0
                  1 0.86 0 0 0
                  1 0.28 0 0 0
                  0 0    0 1 0" />
      </filter>
    `);
  }

  static get errMatrix() {
    return this.build(`
      <filter id="actionError" color-interpolation-filters="sRGB">
        <feColorMatrix in="SourceGraphic" type="matrix"
          values="1 0.89 0 0 0
                  1 0.43 0 0 0
                  1 0.43 0 0 0
                  0 0    0 1 0" />
      </filter>
    `);
  }
}

//const container = SVG.create('svg');