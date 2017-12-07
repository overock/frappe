import Node from './node';
import ModelFactory from '../main/modelfactory';

export default class JSONConverter {
  static
  import (pool, json) {
    pool.clear();

    // stage #1: create actions
    const inp = new In(),
          rel = [];
    Object.keys(json)
      .filter(tag => [ '@', '#', '!' ].indexOf(tag[0]) == -1)
      .forEach(tag => [].concat(json[tag]).forEach(body => pool.add(inp[tag](body, rel))));

    // stage #2: build nameMap;
    rel.map(r => {
      return {
        f: pool.find(m => m.name == r[0] || m.type == r[0]),
        t: pool.find(m => m.name == r[1] || m.type == r[1]),
        pred: r[2]
      };
    }).forEach(r => {
      if(!r.f || !r.t) return; // 모델이 없는 경우가 있음

      const flow = ModelFactory.create('flow');
      flow.name = r.pred || '';
      r.f.linkBefore(flow);
      r.t.linkAfter(flow);
      pool.add(flow);
    });

    // stage #4: positioning
    const cursor = { x: 50, y: 50 };
    (cursor);

    pool.render();
  }

  static
  export (pool) {
    const ret = new Node({}).prop({
            name: pool.title,
            xmlns: 'uri:oozie:workflow:0.5'
          }),
          out = new Out(),
          proc = v => out[v.type](ret, v);
    pool.container.filter(v => v.type == 'start').forEach(proc);
    pool.container.filter(v => !v.isFlow && ['start', 'end', 'kill'].indexOf(v.type) == -1).forEach(proc);
    pool.container.filter(v => v.type == 'kill').forEach(proc);
    pool.container.filter(v => v.type == 'end').forEach(proc);
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
    const {
            '!left': left = 0,
            '!top': top = 0,
            '@to': next
          } = body,
          ret = ModelFactory.create('start', top, left);

    rel.push([ 'start', next ]);

    return ret;
  }
  end(body) {
    const {
            '!left': left = 0,
            '!top': top = 0
          } = body;
    return ModelFactory.create('end', top, left);
  }
  kill(body) {
    const {
            '!left': left = 0,
            '!top': top = 0,
            '@name': name,
            message: {
              '#text': message
            }
          } = body,
          ret = ModelFactory.create('kill', top, left);

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
    const {
            '!left': left = 0,
            '!top': top = 0,
            '@name': name,
            'switch': {
              'case': node = [],
              'default': defNode = ''
            }
          } = body,
          ret = ModelFactory.create('decision', top, left);

    ret.name = name;
    node.concat(defNode).forEach(o => rel.push([name, o['@to']]));
    return ret;
  }
  fork(body, rel) {
    const {
            '!left': left = 0,
            '!top': top = 0,
            '@name': name,
            'path': path = []
          } = body,
          ret = ModelFactory.create('fork', top, left);

    ret.name = name;
    path.forEach(o => rel.push([ name, o['@start'] ]));

    return ret;
  }
  join(body, rel) {
    const {
            '!left': left = 0,
            '!top': top = 0,
            '@name': name,
            '@to': next
          } = body,
          ret = ModelFactory.create('join', top, left);

    ret.name = name;
    rel.push([ name, next ]);

    return ret;
  }

  action(body, rel) {
    const {
            '!left': left = 0,
            '!top': top = 0,
            '@name': name,
            'ok': okNode = {},
            'error': errNode = {}
          } = body, {
            '@to': okTo
          } = okNode, {
            '@to': errTo
          } = errNode,
          tagName = Object.keys(body).filter(k => [ '@', '#', '!' ].indexOf(k[0]) == -1 && ['ok', 'error'].indexOf(k) == -1)[0],
          ret = ModelFactory.create(tagName, top, left);

    this[`_${tagName}`](ret, body[tagName]);

    ret.name = name;
    rel.push([ name, okTo ]);
    rel.push([ name, errTo ]);

    return ret;
  }

  ['_map-reduce'](model, tagBody) {
    model.props = {
      'general': {},
      'advanced': {}
    };
    let targetMap = {
      'configuration': 'general.configuration'
    };

    [ 'configuration', 'prepare', 'file', 'archive' ].forEach(k => {
      this._addProp(model.props, k, this._convert(k, tagBody[k]), targetMap);
    });
  }
  _pig(model, tagBody) {}
  _fs(model, tagBody) {
    console.log('fs: ', JSON.stringify(tagBody));

    // 기본 properties 구조 선언
    model.props = { 'general': {} };

    // 공통 컨버트 메소드 사용
    let targetMap = {
      'configuration': 'general.configuration'
    };
    [ 'configuration' ].forEach(k => {
      this._addProp(model.props, k, this._convert(k, tagBody[k]), targetMap);
    });

    // fs 전용 컨버트


    console.log(JSON.stringify(model.props));
  }
  _ssh(model, tagBody) {
    model.props = {
      'general': {
        'config': {
          'host': tagBody.host['#text'],
          'command': tagBody.command['#text'],
          'argument': [],
          'capture-output': tagBody['capture-output'] ? true : false,
        }
      }
    };
    let targetMap = {
      'argument': 'advanced.config.argument'
    };
    [ 'argument' ].forEach(k => {
      this._addProp(model.props, k, this._convert(k, tagBody[k]), targetMap);
    });
  }
  ['_sub-workflow'](model, tagBody) {}
  _java(model, tagBody) {}
  _email(model, tagBody) {}
  _shell(model, tagBody) {
    model.props = {
      'general': {
        'config': {
          'capture-output': tagBody['capture-output'] ? true : false,
          'execOption': tagBody['exec']['script'] ? 'script' : 'command'
        },
        'exec': {}
      },
      'advanced': {}
    };
    let g = model.props.general;
    g.exec[g.config.execOption] = tagBody.exec['#text'];
    let targetMap = {
      'env-var': 'advanced.env-var'
    };
    [ 'env-var', 'prepare', 'configuration', 'argument', 'archive', 'file' ].forEach(k => {
      this._addProp(model.props, k, this._convert(k, tagBody[k]), targetMap);
    });
  }
  _hive(model, tagBody) {}
  _sqoop(model, tagBody) {}
  _distcp(model, tagBody) {}
  _spark(model, tagBody) {}
  _hive2(model, tagBody) {
    model.props = {
      'general': {
        'config': {
          'jdbc-url': tagBody['jdbc-url']['#text'],
          'password': tagBody['password']['#text'],
          'hiveOption': tagBody.script ? 'script' : 'query'
        }
      },
      'advanced': {}
    };
    tagBody.script ? model.props.general.script = {
      script: tagBody.script['#text']
    } : model.props.general.query = {
      query: tagBody.query['#text']
    };
    [ 'argument', 'param', 'archive', 'file', 'prepare', 'configuration' ].forEach(k => {
      this._addProp(model.props, k, this._convert(k, tagBody[k]));
    });
  }
  _addProp(props, propKey, propValue, targetMap) {
    // target으로 property를 추가하는 함수
    // targetMap 인자를 이용해서 위치 지정 가능

    let default_target = {
      'prepare': 'advanced.prepare',
      'archive': 'advanced.archive',
      'file': 'advanced.file',
      'argument': 'advanced.argument',
      'param': 'advanced.param',
      'configuration': 'advanced.configuration'
    };
    Object.assign(default_target, targetMap);
    let target = default_target[propKey];

    if(!propValue) return;
    // 2depth 이상일 경우 
    let p = target.split('.');
    let pr = props;
    for(let i = 0; i < p.length - 1; i++) {
      pr = pr[p[i]];
      !pr ? pr = {} : '';
    }
    pr[p[p.length - 1]] = propValue;

  }

  // convert wrapper 역할. 값 체크와 세부 convert로 분기를 함
  _convert(key, value) {
    // key에 따라서 convert 함수를 호출하는 wrapper

    // value가 없으면 undefined return
    if(!value) return;
    let keyMap = {
      configuration: 'configuration',
      prepare: 'prepare',
      argument: 'dynamic',
      archive: 'dynamic',
      file: 'dynamic',
      param: 'dynamic',
      'env-var': 'dynamic'
    };
    console.log(key, keyMap[key]);
    return this[`_convert_${keyMap[key]}`](value);
  }
  // 세부 convert 함수들
  _convert_dynamic(text) {
    let arr = [];
    [].concat(text).forEach(i => arr.push(i['#text']));
    return arr;
  }
  _convert_prepare(pre) {
    let arr = [];
    [].concat(pre).forEach(k => {
      const ocmd = Object.keys(k)[0];
      const cmd = ocmd.split('!')[0];
      let values = {};
      Object.keys(k[ocmd]).forEach(a => {
        values[a.split('@')[1]] = k[ocmd][a];
      });
      arr.push({
        'key': cmd,
        'values': values
      });
    });
    return arr;
  }
  _convert_configuration(conf) {
    let arr = [];
    [].concat(conf).forEach(k => {
      arr.push({
        name: k.property.name['#text'],
        value: k.property.value['#text']
      });
    });
    return arr;
  }
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
    const a = r.tag('action').prop('name', v.name),
          b = a.tag(v.type),
          {
            jobTracker: j,
            nameNode: n
          } = o || {};

    this._geometry(a, v);
    j && b.tag('job-tracker').text('${jobTracker}');
    n && b.tag('name-node').text('${nameNode}');
    $h(b);
    v.nextActions.forEach(n => a.tag(n.type == 'kill' ? 'error' : 'ok').prop('to', n.name));

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
    const tag = r.tag('decision').prop('name', v.name),
          pred = tag.tag('switch');
    this._geometry(tag, v);
    v.next.forEach(f => pred.tag('case').text(f.name).prop('to', f.next[0].name));
    // TODO: default는 언제? 어떻게? 넣지?
  }
  fork(r, v) {
    const tag = r.tag('fork').prop('name', v.name);
    this._geometry(tag, v);
    v.nextActions.forEach(a => tag.tag('path').prop('start', a.name));
  }
  join(r, v) {
    const tag = r.tag('join').prop('name', v.props.name).prop('to', v.nextAction.name);
    this._geometry(tag, v);
  }

  //action
  ['map-reduce'](r, v) {
    return this._action(r, v, body => {
      const { general: gen, advanced: adv } = v.props;
      adv.prepare.forEach((o, i) => {
        const cmd = body.tag('prepare').tag(`${o.key}!${i}`);
        Object.keys(o.values).forEach(k => cmd.prop(k, o.values[k]));
      });
      gen.configuration.forEach(o => {
        const cmd = body.tag('configuration').tag('property');
        Object.keys(o).forEach(k => cmd.tag(k).text(o[k]));
      });

      [ 'file', 'archive' ].forEach(k => adv[k] && adv[k].forEach(t => body.tag(k).text(t)));
    }, {
      jobTracker: true,
      nameNode: true
    });
  }

  pig(r, v) {
    return this._action(r, v, body => {
      const { general: gen, advanced: adv } = v.props;
      adv.prepare.forEach((o, i) => {
        const cmd = body.tag('prepare').tag(`${o.key}!${i}`);
        Object.keys(o.values).forEach(k => cmd.prop(k, o.values[k]));
      });

      adv.configuration.forEach(o => {
        const cmd = body.tag('configuration').tag('property');
        Object.keys(o).forEach(k => cmd.tag(k).text(o[k]));
      });
      body.tag('script').text(gen.config.script);

      [ 'param', 'argument', 'file', 'archive' ].forEach(k => adv[k] && adv[k].forEach(t => body.tag(k).text(t)));
    }, {
      jobTracker: true,
      nameNode: true
    });
  }

  fs(r, v) {
    return this._action(r, v, body => {
      const { command: cmd, configuration: conf } = v.props.general;
      conf.forEach(o => {
        const cmd = body.tag('configuration').tag('property');
        Object.keys(o).forEach(k => cmd.tag(k).text(o[k]));
      });
      
      cmd.forEach((c, i) => {
        const tag = body.tag(`${c.key}!${i}`),
              val = c.values;
        
        switch(c.key) {
          case 'mkdir':
          case 'touchz':
          case 'delete':
          case 'move':
            Object.keys(val).forEach(k => tag.prop(k, val[k]));
            break;
          case 'chmod':
            tag.prop('path', val.path);
            const permissions = [ 0, 0, 0 ];
            [ 'owner', 'group', 'others' ].forEach((u, j) => [ 'read', 'write', 'execute' ].forEach(p => permissions[j] += val[`permissions.${u}.${p}`] | 0));
            tag.prop('permissions', permissions.join(''));
            val['dir-files'] && tag.prop('dir-files', val['dir-files']);
            val.recursive && tag.tag('recursive');
            break;
          case 'chgrp':
            tag.prop('path', val.path);
            tag.prop('group', val.group);
            val['dir-files'] && tag.prop('dir-files', val['dir-files']);
            val.recursive && tag.tag('recursive');
            break;
        }
      });
    }, {
      nameNode: true
    });

  }

  ssh(r, v) {
    return this._action(r, v, body => {
      const { general: gen } = v.props;

      body.tag('host').text(gen.config.host);
      body.tag('command').text(gen.config.command);
      [ 'args' ].forEach(k => gen.config[k] && gen.config[k].forEach(t => body.tag(k).text(t)));
      gen.config['capture-output'] && gen.config['capture-output'] == true && body.tag('capture-output');
    });
  }

  ['sub-workflow'](r, v) {
    return this._action(r, v, body => {
      const { config: rconf, configuration: oconf } = v.props.general;

      body.tag('app-path').text(rconf['app-path']);
      rconf['propagate-configuration'] && rconf['propagate-configuration'] == true && body.tag('propagate-configuration');
      oconf.forEach(o => {
        const cmd = body.tag('configuration').tag('property');
        Object.keys(o).forEach(k => cmd.tag(k).text(o[k]));
      });
    });
  }

  java(r, v) {
    return this._action(r, v, body => {
      const { general: gen, advanced: adv } = v.props;

      adv.prepare.forEach((o, i) => {
        const cmd = body.tag('prepare').tag(`${o.key}!${i}`);
        Object.keys(o.values).forEach(k => cmd.prop(k, o.values[k]));
      });
      adv.configuration.forEach(o => {
        const cmd = body.tag('configuration').tag('property');
        Object.keys(o).forEach(k => cmd.tag(k).text(o[k]));
      });
      body.tag('main-class').text(gen.config['main-class']);
      gen.config['java-opts'] && body.tag('java-opts').text(gen.config['java-opts']);
      [ 'arg', 'archive', 'file' ].forEach(k => adv[k] && adv[k].forEach(t => body.tag(k).text(t)));
      gen.config['capture-output'] && gen.config['capture-output'] == true && body.tag('capture-output');
    }, {
      jobTracker: true,
      nameNode: true
    });
  }

  email(r, v) {
    return this._action(r, v, body => {
      const { config: conf } = v.props.general;

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

      adv.configuration.forEach(o => {
        const cmd = body.tag('configuration').tag('property');
        Object.keys(o).forEach(k => cmd.tag(k).text(o[k]));
      });
      body.tag('exec').text(gen.exec[gen.config.execOption]);
      [ 'argument', 'env-var', 'file', 'archive' ].forEach(k => adv[k] && adv[k].forEach(t => body.tag(k).text(t)));
      gen.config['capture-output'] && gen.config['capture-output'] == true && body.tag('capture-output');
    }, {
      jobTracker: true,
      nameNode: true
    });
  }

  hive(r, v) {
    return this._action(r, v, body => {
      const {
              general: gen,
              advanced: adv
            } = v.props,
            w = gen.config.hiveOption;
      adv.prepare.forEach((o, i) => {
        const cmd = body.tag('prepare').tag(`${o.key}!${i}`);
        Object.keys(o.values).forEach(k => cmd.prop(k, o.values[k]));
      });

      adv.configuration.forEach(o => {
        const cmd = body.tag('configuration').tag('property');
        Object.keys(o).forEach(k => cmd.tag(k).text(o[k]));
      });
      body.tag(w).text(gen[w][w]);

      [ 'param', 'file', 'archive' ].forEach(k => adv[k] && adv[k].forEach(t => body.tag(k).text(t)));
    }, {
      jobTracker: true,
      nameNode: true
    });
  }

  sqoop(r, v) {
    return this._action(r, v, body => {
      const { general: gen, advanced: adv } = v.props,
            conf = gen.config;

      adv.prepare.forEach((o, i) => {
        const cmd = body.tag('prepare').tag(`${o.key}!${i}`);
        Object.keys(o.values).forEach(k => cmd.prop(k, o.values[k]));
      });

      adv.configuration.forEach(o => {
        const cmd = body.tag('configuration').tag('property');
        Object.keys(o).forEach(k => cmd.tag(k).text(o[k]));
      });
      conf.command && body.tag('command').text(conf.command);
      conf.arg && [ 'arg' ].forEach(k => conf[k] && conf[k].forEach(t => body.tag(k).text(t)));
      [ 'file', 'archive' ].forEach(k => adv[k] && adv[k].forEach(t => body.tag(k).text(t)));
    }, {
      jobTracker: true,
      nameNode: true
    });
  }

  distcp(r, v) {
    return this._action(r, v, body => {
      const { general: gen, advanced: adv } = v.props;

      adv.prepare.forEach((o, i) => {
        const cmd = body.tag('prepare').tag(`${o.key}!${i}`);
        Object.keys(o.values).forEach(k => cmd.prop(k, o.values[k]));
      });
      adv.configuration.forEach(o => {
        const cmd = body.tag('configuration').tag('property');
        Object.keys(o).forEach(k => cmd.tag(k).text(o[k]));
      });
      gen.config['java-opts'] && body.tag('java-opts').text(gen.config['java-opts']);
      [ 'arg' ].forEach(k => gen[k] && gen[k].forEach(t => body.tag(k).text(t)));
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

      adv.configuration.forEach(o => {
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

      [ 'file', 'archive' ].forEach(k => adv[k] && adv[k].forEach(t => body.tag(k).text(t)));
    }, {
      jobTracker: true,
      nameNode: true
    });
  }

  hive2(r, v) {
    return this._action(r, v, body => {
      const { general: gen, advanced: adv } = v.props,
            w = gen.config.hiveOption;

      adv.prepare.forEach((o, i) => {
        const cmd = body.tag('prepare').tag(`${o.key}!${i}`);
        Object.keys(o.values).forEach(k => cmd.prop(k, o.values[k]));
      });
      adv.configuration.forEach(o => {
        const cmd = body.tag('configuration').tag('property');
        Object.keys(o).forEach(k => cmd.tag(k).text(o[k]));
      });
      body.tag('jdbc-url').text(gen.config['jdbc-url']);
      gen.config.password && body.tag('password').text(gen.config.password);
      body.tag(w).text(gen[w][w]);

      [ 'param', 'argument', 'file', 'archive' ].forEach(k => adv[k] && adv[k].forEach(t => body.tag(k).text(t)));
    }, {
      jobTracker: true,
      nameNode: true
    });
  }
}