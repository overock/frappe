import Node from './node';
import uuid from '../util/uuid';

export default class JSONConverter {
    static import(pool, json) {
        const
            tags = Object.keys(json),
            nameMap = new Map(),
            rel = [];

        // stage #1: collect names and create uuids
        const findNames = o => {
            let ret = [];
            Object.keys(o).forEach(k => {
                if(k=='@name')
                    o[k] && ret.push(o[k]);
                else if(typeof o[k] == 'object')
                    ret = ret.concat(findNames(o[k]));
            });
            return ret;
        };

        findNames(json).forEach(s => nameMap.set(s, uuid()));   // 아, 덴쟝. uuid 부분이 꼬인다

        // stage #2: trunk pool
        pool.clear();

        // stage #3: create actions
        const inp = new In();
        tags.forEach(t => [].concat(json[t]).forEach(p => pool.add(inp[t](p, nameMap, rel))));

        // stage #4: create flows?
        rel.forEach(r => r);

        // stage #5: positioning
        
    }

    static export(pool) {
        const
            ret = new Node({}).prop({ name: pool.title, xmlns: 'uri:oozie:workflow:0.1' }),
            out = new Out();
        pool.container.filter(v => !v.isFlow).forEach(v => out[v.type](ret, v));
        return ret;
    }

}

const actions = [ 'map-reduce', 'pig', 'fs', 'sub-workflow', 'java' ];
let in_instance,
    out_instance;

class In {
    constructor() {
        if(in_instance) return in_instance;
        in_instance = this;
        //actions.forEach(k => this[k] = this.action);
    }

    link(from, to) { this.rel.push([from, to]); }

    start(o, p, m, r) { o,p,m,r; }
}

class Out {
    constructor() {
        if(out_instance) return out_instance;
        out_instance = this;
        // babel에서 proxy trap을 쓸 수가 없으니... 안타깝지말 할 수 없다 ㅠ
        //actions.forEach(k => this[k] = this.action);
    }

    // control/flow
    start(r, v) { r.tag('start').prop('to', v.nextAction.name); }
    end(r, v) { r.tag('end').prop('name', v.name); }
    kill(r, v) { r.tag('kill').prop('name', v.name).tag('message').text(v.props.message); }
    decision(r, v) {
        const c = r.tag('decision').prop('name', v.name).tag('switch');
        v.next.forEach(f => c.tag('case').text(f.props.predicate).prop('to', f.next[0].name));
        // TODO: default는 언제? 어떻게? 넣지?
    }
    fork(r, v) {
        const c = r.tag('fork').prop('name', v.name);
        v.nextActions.forEach(a => c.tag('path').prop('start', a.name));
    }
    join(r, v) { r.tag('join').prop('name', v.name).prop('to', v.nextAction.name); }

    //action
    _action(r, v) {
        const c = r.tag('action').prop('name', v.name);
        v.nextActions.forEach(a => c.tag(a.type=='kill'? 'error' : 'ok').prop('to', a.name));
        return c.tag(v.type);
    }

    ['map-reduce'](r, v) {
        const body = this._action(r,v);
        // general
        // advanced
    }

    fs(r, v) {
        const body = this._action(r,v);

    }
}