export default class Converter {
    static import(pool, json) { pool, json; }

    static export(pool) {
        const ret = new Node().prop('name', pool.title).prop('xmlns', 'uri:oozie:workflow:0.1');
        
        pool.container.filter(v => !v.isFlow).forEach(v => {
            let tag;    // eslint no-case-declarations rule
            switch(v.type) {
            case 'start':
                ret.tag('start').prop('to', v.nextAction.uuid);
                break;
            case 'end':
                ret.tag('end').prop('name', v.uuid);
                break;
            case 'kill':
                ret.tag('kill').prop('name', v.uuid).tag('message').text(v.props.message);
                break;
            case 'decision':
                tag = ret.tag('decision').prop('name', v.uuid).tag('switch');
                v.nextActions.forEach(a => tag.tag('case').prop('to', a.uuid));
                break;
            case 'fork':
                tag = ret.tag('fork').prop('name', v.uuid);
                v.nextActions.forEach(a => tag.tag('path').prop('start', a.uuid));
                break;
            case 'join':
                ret.tag('join').prop('name', v.uuid).prop('to', v.nextAction.uuid);
                break;
            default:
                ret.tag('action').prop('name', v.uuid).tag(v.type);
            }
        });

        return ret;
    }
}

class Node {
    constructor(o) {
        o = o || {};
        for(let k in o) o.hasOwnProperty(k) && (this[k] = o[k]);
    }

    tag(t, c) {
        const o = new Node(c);
        !this[t]? (this[t] = o) : this[t] instanceof Array? this[t].push(o) : (this[t]=[this[t]]).push(o);
        return o;
    }

    // TODO: k가 hashMap이면 한 방에 다 집어넣는 걸로 가는 게 더 좋지 않을까?
    prop(k, v) { if(typeof v=='undefined') delete this['@'+k]; else this['@'+k] = v; return this; }
    text(v) { if(typeof v=='undefined') delete this['#text']; else this['#text'] = v; return this; }
}

// 4 test
window.json = Converter;