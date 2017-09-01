import ModelFactory from './rendererfactory';

let instance = null;

export default class {
    constructor() {
        if(instance) return instance;

        this.container = [];

        instance = this;
    }

    get ids() { return this.container.map(v => v.uuid); }
    indexOf(uuid) { return this.ids.indexOf(uuid); }
    item(uuid) { return this.container[this.ids.indexOf(uuid)]; }

    add(model) {
        if(typeof model == 'string') model = ModelFactory.create(model);
        this.container.push(model);
        return model;
    }

    remove(model) {
        if(typeof model == 'string') model = this.item(model);
        if(!model) return;
        model.unlinkAll();

        let i = this.indexOf(model.uuid);
        i>=0 && this.container.splice(i, 1);
    }

    export() {
        const ret = {};

        this.container.filter(v => !v.isDecision).forEach(v => {
            const action = {
                '@name': v.uuid
            };
            
            v.next.map(v => v.next[0]).forEach(v => {
                switch(v.type) {
                case 'kill':
                    action['error'] = { '@to': v.uuid };
                    break;

                default:
                    action['ok'] = { '@to': v.uuid };
                }
            });
            
            ret[v.type] = action;
        });

        return ret;
    }

    render() { this.container.forEach(m => m.render()); }

    // some iterator proxies
    filter(fn) { return this.container.filter(fn); }
    find(fn) { return this.container.find(fn); }
}