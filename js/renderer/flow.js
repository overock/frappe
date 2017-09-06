import Renderer from './base';

export default class FlowRenderer extends Renderer {
    constructor(model) {
        super(model, `
            <line class="frappe-flow" marker-end="url(#dest)" />
            <line class="frappe-flow-holder" />
            <use href="#flowSnapTo" class="frappe-handle" width="16" height="16" />
        `);

        this.props.predicate = '';
    }

    get holder() { return this.el.getElementsByClassName('frappe-flow-holder')[0]; }
    get handle() { return this.el.getElementsByClassName('frappe-handle')[0]; }

    update(model) {
        model.fitToNodes();
        super.update(model);
        this.element.setAttribute('x1', model.left);
        this.element.setAttribute('y1', model.top);
        this.element.setAttribute('x2', model.right);
        this.element.setAttribute('y2', model.bottom);
        this.holder.setAttribute('x1', model.left);
        this.holder.setAttribute('y1', model.top);
        this.holder.setAttribute('x2', model.right);
        this.holder.setAttribute('y2', model.bottom);
        this.handle.setAttribute('x', model.left + model.width/2 - 4);
        this.handle.setAttribute('y', model.top + model.height/2 - 4);
    }
}