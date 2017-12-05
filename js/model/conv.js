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
        console.log(nameMap);

        // stage #2: trunk pool
        pool.clear();

        // stage #3: create actions
        const inp = new In();
       // tags.forEach(t => [].concat(json[t]).forEach(p => pool.add(inp[t](p, nameMap, rel))));

        // stage #4: create flows?
        rel.forEach(r => r);

        // stage #5: positioning
        const cursor = { x: 50, y: 50 }
        
    }

    static export(pool) {
        const
            ret = new Node({}).prop({ name: pool.title, xmlns: 'uri:oozie:workflow:0.1' }),
            out = new Out(),
            proc = v => out[v.type](ret, v);
        pool.container.filter(v => v.type=='start').forEach(proc);
        pool.container.filter(v => !v.isFlow && ['start', 'end', 'kill'].indexOf(v.type)==-1).forEach(proc);
        pool.container.filter(v => v.type=='kill').forEach(proc);
        pool.container.filter(v => v.type=='end').forEach(proc);
        return ret;
    }

}

//const actions = [ 'map-reduce', 'pig', 'fs', 'sub-workflow', 'java' ];
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
    }

    // control/flow
    start(r, v) { r.tag('start').prop('to', v.nextAction.name); }
    end(r, v) { r.tag('end').prop('name', v.name); }
    kill(r, v) { r.tag('kill').prop('name', v.name).tag('message').text(v.props.message); }
    decision(r, v) {
        const c = r.tag('decision').prop('name', v.name).tag('switch');
        v.next.forEach(f => c.tag('case').text(f.name).prop('to', f.next[0].name));
        // TODO: default는 언제? 어떻게? 넣지?
    }
    fork(r, v) {
        const c = r.tag('fork').prop('name', v.name);
        v.nextActions.forEach(a => c.tag('path').prop('start', a.name));
    }
    join(r, v) { r.tag('join').prop('name', v.props.cond).prop('to', v.nextAction.name); }

    //action
    _action(r, v, bBypass) {
        const c = r.tag('action').prop('name', v.name);
        v.nextActions.forEach(a => c.tag(a.type=='kill'? 'error' : 'ok').prop('to', a.name));
        if(!bBypass) {
            c.tag('job-tracker').text('${jobTracker}');
            c.tag('name-node').text('${nameNode}');
        }
        return c.tag(v.type);
    }

    ['map-reduce'](r, v) {
        const
            body = this._action(r, v),
            { general : gen, advanced : adv } = v.props;
        adv.prepare.forEach((o, i) => {
            const cmd = body.tag('prepare').tag(`${o.key}!${i}`);
            Object.keys(o.values).forEach(k => cmd.prop(k, o.values[k]));
        });       
        gen.configuration.forEach((o, i) => {
            const cmd = body.tag('configuration').tag('property');
            Object.keys(o).forEach(k => cmd.tag(k).text(o[k]));
        });

        ['file', 'archive'].forEach(k => adv[k] && adv[k].forEach(t => body.tag(k).text(t)));

    }

    pig(r, v) {
        const
            body = this._action(r, v),
            { general : gen, advanced : adv } = v.props;
        adv.prepare.forEach((o, i) => {
            const cmd = body.tag('prepare').tag(`${o.key}!${i}`);
            Object.keys(o.values).forEach(k => cmd.prop(k, o.values[k]));
        });

        adv.configuration.forEach((o, i) => {
            const cmd = body.tag('configuration').tag('property');
            Object.keys(o).forEach(k => cmd.tag(k).text(o[k]));
        });        
        body.tag('script').text(gen.config.script);

        ['param', 'argument', 'file', 'archive'].forEach(k => adv[k] && adv[k].forEach(t => body.tag(k).text(t)));

    }

    fs(r, v) {
        const
            body = this._action(r, v),
            { command: cmd, configuration: conf } = v.props.general;
        conf.forEach((o, i) => {
            const cmd = body.tag('configuration').tag('property');
            Object.keys(o).forEach(k => cmd.tag(k).text(o[k]));
        });
        // key를 가지고 switch 
        cmd.forEach((c, i) => {
            const tag = body.tag(`${c.key}!${i}`), val = c.values;
            switch(c.key) {
                case 'mkdir':
                case 'touchz':
                case 'delete':
                case 'move':
                    Object.keys(val).forEach(k => tag.prop(k, val[k]));
                    break;
                case 'chmod':
                    tag.prop('path', val.path);
                    const permissions = [0, 0, 0];
                    ['owner', 'group', 'others'].forEach((u, j) => ['read', 'write', 'execute'].forEach(p => permissions[j] += val[`permissions.${u}.${p}`]|0));
                    tag.prop('permissions', permissions.join(''));
                    val['dir-files'] && tag.prop('dir-files', val['dir-files']);
                    val.recursive && val.recursive=='true' && tag.tag('recursive');
                    break;
                case 'chgrp':
                    tag.prop('path', val.path);
                    tag.prop('group', val.group);
                    val['dir-files'] && tag.prop('dir-files', val['dir-files']);
                    val.recursive && val.recursive=='true' && tag.tag('recursive');
                    break;
            }

        });

    }

    ssh(r, v) {
        const
            body = this._action(r, v, true),
            { general : gen } = v.props;

        body.tag('host').text(gen.config.host);
        body.tag('command').text(gen.config.command);
        ['args'].forEach(k => gen.config[k] && gen.config[k].forEach(t => body.tag(k).text(t)));
        gen.config['capture-output'] && gen.config['capture-output'] == true && body.tag('capture-output');
    }

    ['sub-workflow'](r, v) {
        const
            body = this._action(r, v, true),
            { config : rconf, configuration : oconf  } = v.props.general;

        body.tag('app-path').text(rconf['app-path']);
        rconf['propagate-configuration'] && rconf['propagate-configuration'] == true && body.tag('propagate-configuration');
        oconf.forEach((o, i) => {
            const cmd = body.tag('configuration').tag('property');
            Object.keys(o).forEach(k => cmd.tag(k).text(o[k]));
        });
    }

    java(r, v) {
        const
            body = this._action(r, v),
            { general : gen, advanced : adv } = v.props;

        adv.prepare.forEach((o, i) => {
            const cmd = body.tag('prepare').tag(`${o.key}!${i}`);
            Object.keys(o.values).forEach(k => cmd.prop(k, o.values[k]));
        })
        adv.configuration.forEach((o, i) => {
            const cmd = body.tag('configuration').tag('property');
            Object.keys(o).forEach(k => cmd.tag(k).text(o[k]));
        });            
        body.tag('main-class').text(gen.config['main-class']);
        gen.config['java-opts'] && body.tag('java-opts').text(gen.config['java-opts']);
        ['arg', 'archive', 'file'].forEach(k => adv[k] && adv[k].forEach(t => body.tag(k).text(t)));
        gen.config['capture-output'] && gen.config['capture-output'] == true && body.tag('capture-output');
    }

    email(r, v) {
        const
            body = this._action(r, v, true),
            { config : conf } = v.props.general;
        conf.to && body.tag('to').text(conf.to);
        conf.cc && body.tag('cc').text(conf.cc);
        conf.bcc && body.tag('bcc').text(conf.bcc);
        conf.subject && body.tag('subject').text(conf.subject);
        conf.body && body.tag('body').text(conf.body);
        conf.content_type && body.tag('content_type').text(conf.content_type);
        conf.attachment && body.tag('attachment').text(conf.attachment);
    }

    shell(r, v) {
        const
            body = this._action(r, v),
            { general: gen, advanced: adv } = v.props;
        
        adv.prepare.forEach((o, i) => {
            const cmd = body.tag('prepare').tag(`${o.key}!${i}`);
            Object.keys(o.values).forEach(k => cmd.prop(k, o.values[k]));
        });

        adv.configuration.forEach((o, i) => {
            const cmd = body.tag('configuration').tag('property');
            Object.keys(o).forEach(k => cmd.tag(k).text(o[k]));
        });        
        body.tag('exec').text(gen.exec[gen.config.execOption]);
        ['argument', 'env-var', 'file', 'archive'].forEach(k => adv[k] && adv[k].forEach(t => body.tag(k).text(t)));
        gen.config['capture-output'] && gen.config['capture-output'] == true && body.tag('capture-output');
    }

    hive(r, v) {
        const
            body = this._action(r, v),
            { general: gen, advanced: adv } = v.props,
            w = gen.config.hiveOption;
        adv.prepare.forEach((o, i) => {
            const cmd = body.tag('prepare').tag(`${o.key}!${i}`);
            Object.keys(o.values).forEach(k => cmd.prop(k, o.values[k]));
        });
    
        adv.configuration.forEach((o, i) => {
            const cmd = body.tag('configuration').tag('property');
            Object.keys(o).forEach(k => cmd.tag(k).text(o[k]));
        });
        body.tag(w).text(gen[w][w]);

        ['param', 'file', 'archive'].forEach(k => adv[k] && adv[k].forEach(t => body.tag(k).text(t)));
    }

    sqoop(r, v) {
        const
            body = this._action(r, v),
            { general : gen, advanced : adv } = v.props,
            conf = gen.config;

        adv.prepare.forEach((o, i) => {
            const cmd = body.tag('prepare').tag(`${o.key}!${i}`);
            Object.keys(o.values).forEach(k => cmd.prop(k, o.values[k]));
        });

        adv.configuration.forEach((o, i) => {
            const cmd = body.tag('configuration').tag('property');
            Object.keys(o).forEach(k => cmd.tag(k).text(o[k]));
        });           
        conf.command && body.tag('command').text(conf.command);
        conf.arg && ['arg'].forEach(k => conf[k] && conf[k].forEach(t => body.tag(k).text(t))); 
        ['file', 'archive'].forEach(k => adv[k] && adv[k].forEach(t => body.tag(k).text(t)));
    }

    distcp(r, v) {
        const
            body = this._action(r, v),
            { general : gen, advanced : adv } = v.props;

        adv.prepare.forEach((o, i) => {
            const cmd = body.tag('prepare').tag(`${o.key}!${i}`);
            Object.keys(o.values).forEach(k => cmd.prop(k, o.values[k]));
        });
        adv.configuration.forEach((o, i) => {
            const cmd = body.tag('configuration').tag('property');
            Object.keys(o).forEach(k => cmd.tag(k).text(o[k]));
        });
        gen.config['java-opts'] && body.tag('java-opts').text(gen.config['java-opts']);
        ['arg'].forEach(k => gen[k] && gen[k].forEach(t => body.tag(k).text(t)));  
    }

    spark(r, v) {
        const
            body = this._action(r, v),
            { general: gen, option: opt, advanced: adv } = v.props;

        adv.prepare.forEach((o, i) => {
            const cmd = body.tag('prepare').tag(`${o.key}!${i}`);
            Object.keys(o.values).forEach(k => cmd.prop(k, o.values[k]));
        });

        adv.configuration.forEach((o, i) => {
            const cmd = body.tag('configuration').tag('property');
            Object.keys(o).forEach(k => cmd.tag(k).text(o[k]));
        });
        body.tag('master').text(gen.config.master);
        opt.option.mode && body.tag('mode').text(opt.option.mode);
        body.tag('name').text(gen.config.name);
        body.tag('class').text(gen.config.class);
        body.tag('jar').text(gen.config.jar);
        
        opt.option['spark-opts'] && body.tag('spark-opts').text(opt.option['spark-opts']);
        opt.args.forEach(t => body.tag('arg').text(t));

        ['file', 'archive'].forEach(k => adv[k] && adv[k].forEach(t => body.tag(k).text(t)));
    }

    hive2(r, v) {
        const
            body = this._action(r, v),
            { general: gen, advanced: adv } = v.props,
            w = gen.config.hiveOption;
        adv.prepare.forEach((o, i) => {
            const cmd = body.tag('prepare').tag(`${o.key}!${i}`);
            Object.keys(o.values).forEach(k => cmd.prop(k, o.values[k]));
        });  
        adv.configuration.forEach((o, i) => {
            const cmd = body.tag('configuration').tag('property');
            Object.keys(o).forEach(k => cmd.tag(k).text(o[k]));
        });  
        body.tag('jdbc-url').text(gen.config['jdbc-url']);
        gen.config.password && body.tag('password').text(gen.config.password);
        body.tag(w).text(gen[w][w]);

        ['param', 'argument', 'file', 'archive'].forEach(k => adv[k] && adv[k].forEach(t => body.tag(k).text(t)));
    }
}