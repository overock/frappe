import Renderer from './base';

export default class ActionRenderer extends Renderer {
    constructor(model, def) {
        super(model, `
            ${def.markup}
            <text class="frappe-label" font-size="15px"/>
            <use xlink:href="#actionMoveTo" class="frappe-handle" width="72" height="72" />`);
        this.el.classList.add('frappe-action');
        this.el.setAttribute('data-actiontype', model.type);
    }

    get label() { return this.el.getElementsByClassName('frappe-label')[0]; }
    get handle() { return this.el.getElementsByClassName('frappe-handle')[0]; }

    update(model) {
        super.update(model);
        this.element.setAttribute('x', model.left);
        this.element.setAttribute('y', model.top);

        const
            offX = (this.element.getAttribute('width') - this.handle.getAttribute('width'))/2 + 4,
            offY = (this.element.getAttribute('height') - this.handle.getAttribute('height'))/2 + 4;
        this.handle.setAttribute('x', model.left + offX);
        this.handle.setAttribute('y', model.top + offY);

        if(model.isGhost) {
            this.label.style.display = 'none';
        } else {
            this.label.style.display = '';
            this.label.setAttribute('x', model.left + model.width/2);
            this.label.setAttribute('y', model.bottom + 20);
            this.label.textContent = model.name;
        }
    }
}