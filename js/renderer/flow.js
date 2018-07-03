import Renderer from './base';

export default class FlowRenderer extends Renderer {
  constructor(model) {
    super(model, `
            <line class="frappe-flow" marker-end="url(#dest)" />
            <line class="frappe-flow-holder" />
            <text class="frappe-label" />
            <use href="#ascension" data-asc class="frappe-decision-order" width="10" height="9" />
            <use href="#descension" data-desc class="frappe-decision-order" width="10" height="9" />
            <use href="#flowSnapTo" class="frappe-handle" width="16" height="16" />
        `);
  }

  get label() { return this.el.querySelector('.frappe-label'); }
  get holder() { return this.el.querySelector('.frappe-flow-holder'); }
  get handle() { return this.el.querySelector('.frappe-handle'); }
  get asc() { return this.el.querySelector('[data-asc]'); }
  get desc() { return this.el.querySelector('[data-desc]'); }

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

    const //angle = model.angle/Math.PI*180,
          orderX = model.left + model.width/2 - 4,
          orderY = model.top + model.height/2 - 4;

    this.desc.style.display = model.isLast? 'none' : '';
    this.desc.setAttribute('x', orderX - 16);
    this.desc.setAttribute('y', orderY);
    this.asc.style.display = model.order==1? 'none': '';
    this.asc.setAttribute('x', orderX + 16);
    this.asc.setAttribute('y', orderY);

    if(model.editing) {
      this.label.style.display = 'none';
    } else {
      const flip = Math.abs(model.angle)>Math.PI/2,
            factor = flip? -1 : 1,
            angle = model.angle/Math.PI*180 + (flip? 180 : 0),
            labelX = model.left + model.width/2 - 20*Math.sin(model.angle)*factor,
            labelY = model.top + model.height/2 + 20*Math.cos(model.angle)*factor;

      this.label.setAttribute('x', labelX);
      this.label.setAttribute('y', labelY);
      this.label.setAttribute('transform', `rotate(${angle} ${labelX} ${labelY})`);
      this.label.style.display = '';
      this.label.textContent = model.name;
    }
  }
}