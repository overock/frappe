export default class {
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
                v.next.forEach(f => c.tag('switch').text(f.props.predicate).prop('to', f.next[0].name));
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
                
                c.tag(v.type, v.props);
            }
        });

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
        
        p && Object.defineProperty(this, 'parent', { get: () => p });
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

    text(v) { return typeof v=='undefined'? this['#text'] : (this['#text'] = v), this; }
}

// just 4 test
window.Node = Node;