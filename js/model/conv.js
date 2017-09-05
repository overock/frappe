export default class Converter {
    static import(pool, json) { pool, json; }

    static export(pool) {
        const ret = new Node({}).prop({ name: pool.title, xmlns: 'uri:oozie:workflow:0.1' });
        
        pool.container.filter(v => !v.isFlow).forEach(v => {
            let c;    // eslint no-case-declarations rule
            switch(v.type) {
            case 'start':
                ret.tag('start').prop('to', v.nextAction.name);
                break;
            case 'end':
                ret.tag('end').prop('name', v.name);
                break;
            case 'kill':
                ret.tag('kill').prop('name', v.name).tag('message').text(v.props.message);
                break;
            case 'decision':
                c = ret.tag('decision').prop('name', v.name).tag('switch');
                v.nextActions.forEach(a => c.tag('case').prop('to', a.name));
                break;
            case 'fork':
                c = ret.tag('fork').prop('name', v.name);
                v.nextActions.forEach(a => c.tag('path').prop('start', a.name));
                break;
            case 'join':
                ret.tag('join').prop('name', v.name).prop('to', v.nextAction.name);
                break;
            default:
                c = ret.tag('action').prop('name', v.name);
                v.nextActions.forEach(a => a.type == 'kill'
                    ? c.tag('error').prop('to', a.name)
                    : c.tag('ok').prop('to', a.name)
                );
                c = c.tag(v.type);
                for(let k in v.props)
                    c.tag(k).text(v.props[k]);
            }
        });

        return ret;
    }
}

class Node {
    constructor(o, p) {
        o = o || {};
        for(let k in o) o.hasOwnProperty(k) && (this[k] = o[k]);
        p && Object.defineProperty(this, 'parent', { get: ()=>p });
    }

    tag(t, c) {
        const o = new Node(c, this);
        !this[t]? (this[t] = o) : this[t] instanceof Array? this[t].push(o) : (this[t]=[this[t]]).push(o);
        return o;
    }

    children(t) {
        return this[t] instanceof Array? this[t] : typeof this[t] == 'undefined'? [] : [this[t]];
    }

    prop(k, v) {
        if(typeof k=='object')
            for(let kk in k)
                this['@'+kk] = k[kk];
        else if(typeof v=='undefined')
            return this['@'+k];
        else this['@'+k] = v;

        return this;
    }

    text(v) {
        if(typeof v=='undefined')
            return this['#text'];
        else
            this['#text'] = v;

        return this;
    }
}

// 4 test
window.json = Converter;