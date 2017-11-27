import SVG from '../util/svg';
export default class Renderer {
    constructor(model, markup) {
        this.el = SVG.create('g', markup);
        this.el.setAttribute('id', model.uuid);
        this.el.setAttribute('data-type', model.type);
    }

    get element() { return this.el.firstElementChild; }

    create() {}

    update(model) {
        this.element.style.strokeDasharray = model.isGhost? '3, 4' : '';
        this.element.style.opacity = model.isGhost? 0.4 : 1;
    }

    remove() {
        this.el.parentNode.removeChild(this.el);
    }
}