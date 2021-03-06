import Renderer from './base';

export default class ActionRenderer extends Renderer {
  constructor(model, def) {
    super(model, `
            ${def.markup}
            <text class="frappe-label"/>
            <use xlink:href="#actionMoveTo" class="frappe-handle" width="72" height="72" />
            <use xlink:href="#actionRemove" class="frappe-handle" width="20" height="20" />`);
    this.el.classList.add('frappe-action');
    this.el.setAttribute('data-actiontype', model.type);
    this.icon.setAttribute('filter', 'url(#actionNormal)');
  }

  get icon() { return this.el.firstElementChild; }
  get label() { return this.el.querySelector('.frappe-label'); }
  get handle() { return this.el.querySelector('.frappe-handle'); }
  get removeBtn() { return this.el.querySelectorAll('.frappe-handle')[1]; }

  update(model) {
    super.update(model);

    this.element.setAttribute('x', model.left);
    this.element.setAttribute('y', model.top);

    const offX = (this.element.getAttribute('width') - this.handle.getAttribute('width')) / 2 + 4,
          offY = (this.element.getAttribute('height') - this.handle.getAttribute('height')) / 2 + 4;

    this.handle.setAttribute('x', model.left + offX);
    this.handle.setAttribute('y', model.top + offY);
    this.removeBtn.setAttribute('x', model.left + offX + 56);
    this.removeBtn.setAttribute('y', model.top + offY - 2);

    if(model.editing) {
      this.label.style.display = 'none';
    } else {
      this.label.setAttribute('x', model.left + model.width / 2);
      this.label.setAttribute('y', model.bottom + 20);
      this.label.style.display = '';
      this.label.textContent = model.name;

      let status = model.onSave()? 'Error' : model.onExecute()? 'Warning' : 'Normal';
      this.icon.setAttribute('filter', `url(#action${status})`);
    }
  }
}