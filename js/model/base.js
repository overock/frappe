import Node from './node';
import RendererFactory from '../main/rendererfactory';
import uuid from '../util/uuid';

export default class Model {
    constructor(type, top, left, width, height) {
        this.uuid = uuid();
        this.type = type || 'nil';
        this.top = parseFloat(top) || 0;
        this.left = parseFloat(left) || 0;
        this.width = typeof width !== 'undefined'? parseFloat(width) : 64;
        this.height = typeof height !== 'undefined'? parseFloat(height): 64;

        this.props = {};
        this._prev_ = [];
        this._next_ = [];

        this.renderer = RendererFactory.create(this);
    }

    get name() { return this.props.name || ''; }
    set name(s) { this.props.name = s; }

    get id() { return this.uuid; }
    set id(s) { this.uuid || (this.uuid = uuid()); }   // shield code

    get element() { return this.renderer.el; }
    get links() { return this.prev.concat(this.next); }
    get propKeys() { return Object.keys(this.props); }

    get prev() { return this._prev_; }
    get next() { return this._next_; }

    get isFlow() { return false; }


    moveTo(x, y) {
        this.left = x;
        this.top = y;
    }

    resizeTo(w, h) {
        this.width = w;
        this.height = h;
    }

    linkBefore(model) {
        this.next.push(model);
        model.prev.push(this);
    }

    linkAfter(model) {
        this.prev.push(model);
        model.next.push(this);
    }

    unlink(model) {
        const prevIndex = this.prev.findIndex(v=>v==model),
            nextIndex = this.next.findIndex(v=>v==model);
        if(prevIndex>=0) {
            this.prev.splice(prevIndex, 1);
            model.next.splice(model.next.findIndex(v=>v==this), 1);
        } else if(nextIndex>=0) {
            this.next.splice(nextIndex, 1);
            model.prev.splice(model.prev.findIndex(v=>v==this), 1);
        }
    }

    unlinkAll() {
        this.links.forEach(l => this.unlink(l));
    }

    render() {
        this.renderer.update(this);
    }

    remove() {
        this.renderer.remove();
    }
}