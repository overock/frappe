export default class {
    static import(pool, json) { pool, json; }

    static export(pool) {
        const
            ret = new Node({}).prop({ name: pool.title, xmlns: 'uri:oozie:workflow:0.1' }),
            out = new Out();
        pool.container.filter(v => !v.isFlow).forEach(v => out[v.type](ret, v));
        return ret;
    }
}

// not a robust class. use at your own risk
class Node {
    constructor(o, p) {
        if(o instanceof Node)
            return o;
        else if(o instanceof Array)
            return o.map(e => new Node(e));
        else if(o instanceof Object)
            Object.keys(o).forEach(k => o.hasOwnProperty(k) && this.add(k, o[k]));
        
        p && Object.defineProperty(this, 'parent', { value: p });
    }

    children(t) { return typeof this[t]=='undefined'? [] : [].concat(this[t]); }
    
    add(k, v) { return k[0]=='@'? this.prop(k.slice(1), v) : k[0]=='#'? this.text(v) : this.tag(k, v); }

    tag(t, c) {
        if(c instanceof Array) 
            return c.forEach(v => this.add(t, v)), this[t][this[t].length-1];
        else {
            const o = new Node(c, this);
            !this[t]? (this[t] = o) : this[t] instanceof Array? this[t].push(o) : (this[t] = [this[t]]).push(o);
            return o;
        }
    }

    prop(k, v) {
        if(typeof k=='object')
            Object.keys(k).forEach(kk => this.prop(kk, k[kk]));
        else if(typeof v=='undefined')
            return this['@'+k];
        else this['@'+k] = v.toString();

        return this;
    }

    text(v) { return typeof v=='undefined'? this['#text'] : (this['#text'] = v.toString()), this; }
}

let actions = [ 'map-reduce', 'pig', 'fs', 'sub-workflow', 'java' ],
    out_instance;

class Out {
    constructor() {
        if(out_instance) return out_instance;
        out_instance = this;
        // babel에서 proxy trap을 쓸 수가 없으니... 안타깝지말 할 수 없다 ㅠ
        actions.forEach(k => this[k] = this.action);
    }

    start(r, v) { r.tag('start').prop('to', v.nextAction.name); }
    end(r, v) { r.tag('end').prop('name', v.name); }
    kill(r, v) { r.tag('kill').prop('name', v.name).tag('message').text(v.props.message); }
    decision(r, v) {
        const c = r.tag('decision').prop('name', v.name).tag('switch');
        v.next.forEach(f => c.tag('case').text(f.props.predicate).prop('to', f.next[0].name));
    }
    fork(r, v) {
        const c = r.tag('fork').prop('name', v.name);
        v.nextActions.forEach(a => c.tag('path').prop('start', a.name));
    }
    join(r, v) { r.tag('join').prop('name', v.name).prop('to', v.nextAction.name); }
    action(r, v) {
        const c = r.tag('action').prop('name', v.name);
        v.nextActions.forEach(a => c.tag(a.type=='kill'? 'error' : 'ok').prop('to', a.name));
        c.tag(v.type, v.props);
    }
}

// just 4 test
window.Node = Node;