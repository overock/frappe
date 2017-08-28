import Base from './base';

export default class extends Base {
    constructor(model, def) {
        super(model, def.markup + '<use href="#actionMoveTo" class="frappe-handle" width="72" height="72" />');
    }

    get handle() { return this.el.getElementsByClassName('frappe-handle')[0]; }

    update(model) {
        super.update(model);
        this.element.setAttribute('x', model.left);
        this.element.setAttribute('y', model.top);

        const offX = (this.element.getAttribute('width') - this.handle.getAttribute('width'))/2 + 4,
            offY = (this.element.getAttribute('height') - this.handle.getAttribute('height'))/2 + 4;
        this.handle.setAttribute('x', model.left + offX);
        this.handle.setAttribute('y', model.top + offY);
    }
}