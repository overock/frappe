import Renderer from './base';

export default class FlowRenderer extends Renderer {
  constructor(model) {
    super(model, `
            <line class="frappe-flow" marker-end="url(#dest)" />
            <line class="frappe-flow-holder" />
            <text class="frappe-label" />
            <text class="frappe-decision-order frappe-label" />
            <use href="#ascension" class="frappe-decision-order frappe-decision-asc" width="8" height="8" />
            <use href="#descension" class="frappe-decision-order frappe-decision-desc" width="8" height="8" />
            <use href="#change" class="frappe-order width="8" height="8" />
            <use href="#flowSnapTo" class="frappe-handle" width="16" height="16" />
        `);
  }

  get label() { return this.el.getElementsByClassName('frappe-label')[0]; }
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

    this.handle.setAttribute('x', model.left + model.width / 2 - 4);
    this.handle.setAttribute('y', model.top + model.height / 2 - 4);

    if(model.editing) {
      this.label.style.display = 'none';
    } else {
      const labelX = model.left + model.width / 2 - 20 * Math.sin(model.angle),
            labelY = model.top + model.height / 2 + 20 * Math.cos(model.angle);

      this.label.setAttribute('x', labelX);
      this.label.setAttribute('y', labelY);
      this.label.setAttribute('transform', `rotate(${model.angle/Math.PI*180} ${labelX} ${labelY})`);
      this.label.style.display = '';
      this.label.textContent = model.name;
    }
  }
}