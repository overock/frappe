import Node from './node';
import ModelFactory from '../main/modelfactory';
import uuid from '../util/uuid';

export default class JSONConverter {
    static import(pool, json) {
        pool.clear();

        // stage #1: create actions
        const inp = new In(), rel = [];
        Object.keys(json)
            .filter(tag => ['@', '#', '!'].indexOf(tag[0])==-1)
            .forEach(tag => [].concat(json[tag]).forEach(body => pool.add(inp[tag](body, rel))));
        
        // stage #2: build nameMap;
        const
            nameMap = new Map(),
            findNames = o => {
                let ret = [];
                Object.keys(o).forEach(k => {
                    if(k=='@name')
                        o[k] && ret.push(o[k]);
                    else if(typeof o[k] == 'object')
                        ret = ret.concat(findNames(o[k]));
                });
                return ret;
            };

        findNames(json).forEach(s => nameMap.set(s, uuid()));
        nameMap.set('start', pool.find(v => v.type=='start').id);
        nameMap.set('end', pool.find(v => v.type=='end').id);
        
        console.log(nameMap, rel);

        // stage #4: create flows
        rel.forEach(r => {
            const [ f, t ] = r.map(v => pool.item(nameMap.get(v)));
            if(!f || !t) return;    // 모델이 없는 경우가 있음

            const flow = ModelFactory.create('flow');
            
            f.linkBefore(flow);
            t.linkAfter(flow);
        });

        // stage #5: positioning
        const cursor = { x: 50, y: 50 };
        
    }

    static export(pool) {
        const
            ret = new Node({}).prop({ name: pool.title, xmlns: 'uri:oozie:workflow:0.5' }),
            out = new Out(),
            proc = v => out[v.type](ret, v);
        pool.container.filter(v => v.type=='start').forEach(proc);
        pool.container.filter(v => !v.isFlow && ['start', 'end', 'kill'].indexOf(v.type)==-1).forEach(proc);
        pool.container.filter(v => v.type=='kill').forEach(proc);
        pool.container.filter(v => v.type=='end').forEach(proc);
        return ret;
    }
}

let in_instance,
    out_instance;

class In {
    constructor() {
        if(in_instance) return in_instance;
        in_instance = this;
    }

    start(body, rel) {
        const
            ret = ModelFactory.create('start'),
            { '!left': left = 0, '!top': top = 0, '@to': next } = body;
        
        ret.moveTo(left, top);
        rel.push([ 'start', next ]);

        return ret;
    }
    end(body, rel) {
        const
            ret = ModelFactory.create('end'),
            { '!left': left = 0, '!top': top = 0 } = body;

        ret.moveTo(left, top);

        return ret;
    }
    kill(body, rel) {
        const
            ret = ModelFactory.create('kill'),
            {
                '!left': left = 0,
                '!top': top = 0,
                '@name': name,
                message: { '#text': message }
            } = body;
        
        ret.moveTo(left, top);
        ret.props = {
            name: name,
            general: {
                config: {
                    message: message
                }
            }
        };

        return ret;
    }
    decision(body, rel) {
        const ret = ModelFactory.create('decision');
        
        return ret;        
    }
    fork(body, rel) {
        const ret = ModelFactory.create('fork');
        
        return ret;
    }
    join(body, rel) {
        const ret = ModelFactory.create('join');
        
        return ret;
    }

    action(body, rel) {
        const ret = ModelFactory.create('kill');
        // name
        // xmlns
        //.... 
        // 액션명(tag)
        //this.pig(body, nameMap, rel);
        return ret;
    }
    ['map-reduce'](body, rel) {}
}

class Out {
    constructor() {
        if(out_instance) return out_instance;
        out_instance = this;
    }

    // common
    _geometry(n, v) {
        n.option('left', v.left);
        n.option('top', v.top);
    }

    _action(r, v, $h, o) {
        const
            a = r.tag('action').prop('name', v.name),
            b = a.tag(v.type),
            { jobTracker: j, nameNode: n } = o || {};
        
        this._geometry(a, v);
        j && b.tag('job-tracker').text('${jobTracker}');
        n && b.tag('name-node').text('${nameNode}');
        $h(b);
        v.nextActions.forEach(n => a.tag(n.type=='kill'? 'error' : 'ok').prop('to', n.name));

        return a;
    }

    // control/flow
    start(r, v) {
        const tag = r.tag('start');
        this._geometry(tag, v);
        tag.prop('to', v.nextAction.name);
    }
    end(r, v) {
        const tag = r.tag('end');
        this._geometry(tag, v);
        tag.prop('name', v.name);
    }
    kill(r, v) {
        const tag = r.tag('kill');
        this._geometry(tag, v);
        tag.prop('name', v.name).tag('message').text(v.props.general.config.message);
    }
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
    ['map-reduce'](r, v) {
        return this._action(r, v, body => {
            const { general : gen, advanced : adv } = v.props;
            adv.prepare.forEach((o, i) => {
                const cmd = body.tag('prepare').tag(`${o.key}!${i}`);
                Object.keys(o.values).forEach(k => cmd.prop(k, o.values[k]));
            });       
            gen.configuration.forEach((o, i) => {
                const cmd = body.tag('configuration').tag('property');
                Object.keys(o).forEach(k => cmd.tag(k).text(o[k]));
            });
    
            ['file', 'archive'].forEach(k => adv[k] && adv[k].forEach(t => body.tag(k).text(t)));
        }, {
            jobTracker: true,
            nameNode: true
        });
    }

    pig(r, v) {
        return this._action(r, v, body => {
            const { general : gen, advanced : adv } = v.props;
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
        }, {
            jobTracker: true,
            nameNode: true
        });   
    }

    fs(r, v) {
        return this._action(r, v, body => {
            const { command: cmd, configuration: conf } = v.props.general;
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
        }, {
            nameNode: true
        });

    }

    ssh(r, v) {
        return this._action(r, v, body => {
            const { general : gen } = v.props;

            body.tag('host').text(gen.config.host);
            body.tag('command').text(gen.config.command);
            ['args'].forEach(k => gen.config[k] && gen.config[k].forEach(t => body.tag(k).text(t)));
            gen.config['capture-output'] && gen.config['capture-output'] == true && body.tag('capture-output');
        });
    }

    ['sub-workflow'](r, v) {
        return this._action(r, v, body => {
            const { config : rconf, configuration : oconf  } = v.props.general;

            body.tag('app-path').text(rconf['app-path']);
            rconf['propagate-configuration'] && rconf['propagate-configuration'] == true && body.tag('propagate-configuration');
            oconf.forEach((o, i) => {
                const cmd = body.tag('configuration').tag('property');
                Object.keys(o).forEach(k => cmd.tag(k).text(o[k]));
            });
        });
    }

    java(r, v) {
        return this._action(r, v, body => {
            const { general : gen, advanced : adv } = v.props;

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
        }, {
            jobTracker: true,
            nameNode: true
        });
    }

    email(r, v) {
        return this._action(r, v, body => {
            const { config : conf } = v.props.general;
            conf.to && body.tag('to').text(conf.to);
            conf.cc && body.tag('cc').text(conf.cc);
            conf.bcc && body.tag('bcc').text(conf.bcc);
            conf.subject && body.tag('subject').text(conf.subject);
            conf.body && body.tag('body').text(conf.body);
            conf.content_type && body.tag('content_type').text(conf.content_type);
            conf.attachment && body.tag('attachment').text(conf.attachment);
        });
    }

    shell(r, v) {
        return this._action(r, v, body => {
            const { general: gen, advanced: adv } = v.props;
            
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
        }, {
            jobTracker: true,
            nameNode: true
        });
    }

    hive(r, v) {
        return this._action(r, v, body => {
            const { general: gen, advanced: adv } = v.props, w = gen.config.hiveOption;
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
        }, {
            jobTracker: true,
            nameNode: true
        });
    }

    sqoop(r, v) {
        return this._action(r, v, body => {
            const { general : gen, advanced : adv } = v.props, conf = gen.config;

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
        }, {
            jobTracker: true,
            nameNode: true
        });
    }

    distcp(r, v) {
        return this._action(r, v, body => {
            const { general : gen, advanced : adv } = v.props;

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
        }, {
            jobTracker: true,
            nameNode: true
        });
    }

    spark(r, v) {
        return this._action(r, v, body => {
            const { general: gen, option: opt, advanced: adv } = v.props;

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
        }, {
            jobTracker: true,
            nameNode: true
        });
    }

    hive2(r, v) {
        return this._action(r, v, body => {
            const { general: gen, advanced: adv } = v.props, w = gen.config.hiveOption;
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
        }, {
            jobTracker: true,
            nameNode: true
        });
    }
}