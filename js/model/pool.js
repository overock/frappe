import ModelFactory from '../main/modelfactory';
import Converter from './conv';

let instance = null;

export default class ModelPool {
    constructor() {
        if(instance) return instance;

        this.container = [];
        this.nameIdx = {};
        this.title = '';

        instance = this;
    }

    get ids() { return this.container.map(v => v.uuid); }
    indexOf(uuid) { return this.ids.indexOf(uuid); }
    item(uuid) { return this.container[this.ids.indexOf(uuid)]; }

    add(model) {
        if(typeof model == 'string') model = ModelFactory.create(model);
        model.name = model.name || this.name(model);
        this.container.push(model);
        return model;
    }

    remove(model) {
        if(typeof model == 'string') model = this.item(model);
        if(!model) return;

        model.isFlow || model.links.forEach(v => this.remove(v));
        model.unlinkAll();

        let i = this.indexOf(model.uuid);
        i>=0 && this.container.splice(i, 1);

        model.remove();
    }

    clear() { this.container = []; }

    name(model) {
        let t = model.type, c = this.nameIdx[t] || 0;

        if(['start', 'end', 'kill'].indexOf(t)>=0) return t;

        this.nameIdx[t] = ++c;
        return `${t}_${c}`;
    }

    resetNameIndex() {
        this.nameIdx = {};
    }

    import(json) {
        Converter.import(this, json);
        this.render();
    }
    export() { return Converter.export(this); }

    render() { this.container.forEach(m => m.render()); }

    // rulecheckers
    warn() {
    }

    error() {
    }

    // some iterator proxies
    filter(fn) { return this.container.filter(fn); }
    find(fn) { return this.container.find(fn); }
}