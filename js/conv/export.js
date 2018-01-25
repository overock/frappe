let instance = null;

export default class Out {
  constructor() {
    if(instance) return instance;
    instance = this;
  }

  // common
  _geometry(n, v) {
    n.option('left', v.left);
    n.option('top', v.top);
  }

  _action(r, v, $h, o) {
    const a = r.tag('action').prop('name', v.name),
          b = a.tag(v.type),
          { jobTracker: j, nameNode: n } = o || {};

    this._geometry(a, v);
    j && b.tag('job-tracker').text('${jobTracker}');
    n && b.tag('name-node').text('${nameNode}');
    $h(b);
    //v.nextActions.forEach(n => a.tag(n.type == 'kill' ? 'error' : 'ok').prop('to', n.name));
    v.nextActions.filter(n => n.type != 'kill').forEach(n => a.tag('ok').prop('to', n.name));
    v.nextActions.filter(n => n.type == 'kill').forEach(n => a.tag('error').prop('to', n.name));

    return a;
  }

  // control/flow
  start(r, v) {
    const tag = r.tag('start');
    this._geometry(tag, v);
    v.nextAction && tag.prop('to', v.nextAction.name);
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
    v.next.slice(0, -1).forEach(f => {
      const cond = f.cond.replace(/^\$\{.*\}$/, '$1');
      pred.tag('case').text(`\${${cond}}`).prop('to', f.next[0].name);
    });
    v.next.length && pred.tag('default').prop('to', v.next[v.next.length-1].next[0].name);
  }
  fork(r, v) {
    const tag = r.tag('fork').prop('name', v.name);
    this._geometry(tag, v);
    v.nextActions.forEach(a => tag.tag('path').prop('start', a.name));
  }
  join(r, v) {
    const tag = r.tag('join').prop('name', v.props.name);
    v.nextAction && tag.prop('to', v.nextAction.name);
    this._geometry(tag, v);
  }

  //action
  ['map-reduce'](r, v) {
    return this._action(r, v, body => {
      const { general: gen, advanced: adv } = v.props;

      this._addPrepare(adv.prepare, body);
      this._addConfiguration(gen.configuration, body);
      [ 'file', 'archive' ].forEach(k => adv[k] && adv[k].forEach(t => body.tag(k).text(t)));
    }, {
      jobTracker: true,
      nameNode: true
    });
  }

  pig(r, v) {
    return this._action(r, v, body => {
      const { general: gen, advanced: adv } = v.props;

      this._addPrepare(adv.prepare, body);
      this._addConfiguration(adv.configuration, body);
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

      this._addConfiguration(conf, body);
      
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

      body.prop('xmlns', 'uri:oozie:ssh-action:0.1');
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

      this._addConfiguration(oconf, body);
    });
  }

  java(r, v) {
    return this._action(r, v, body => {
      const { general: gen, advanced: adv } = v.props;

      this._addPrepare(adv.prepare, body);
      this._addConfiguration(adv.configuration, body);

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

      body.prop('xmlns', 'uri:oozie:email-action:0.2');
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

      body.prop('xmlns', 'uri:oozie:shell-action:0.3');

      this._addPrepare(adv.prepare, body);
      this._addConfiguration(adv.configuration, body);

      body.tag('exec').text(gen.config.exec);
      [ 'argument', 'env-var', 'file' ].forEach(k => gen[k] && gen[k].forEach(t => body.tag(k).text(t)));
      [ 'archive' ].forEach(k => adv[k] && adv[k].forEach(t => body.tag(k).text(t)));
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

      body.prop('xmlns', 'uri:oozie:hive-action:0.5');

      this._addPrepare(adv.prepare, body);
      this._addConfiguration(adv.configuration, body);

      body.tag(w).text(gen[w][w]);

      [ 'param', 'argument', 'file', 'archive' ].forEach(k => adv[k] && adv[k].forEach(t => body.tag(k).text(t)));
    }, {
      jobTracker: true,
      nameNode: true
    });
  }

  sqoop(r, v) {
    return this._action(r, v, body => {
      const { general: gen, advanced: adv } = v.props,
            conf = gen.config;

      body.prop('xmlns', 'uri:oozie:sqoop-action:0.4');

      this._addPrepare(adv.prepare, body);
      this._addConfiguration(adv.configuration, body);

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

      body.prop('xmlns', 'uri:oozie:distcp-action:0.2');

      this._addPrepare(adv.prepare, body);
      this._addConfiguration(adv.configuration, body);

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

      body.prop('xmlns', 'uri:oozie:spark-action:0.2');

      this._addPrepare(adv.prepare, body);
      this._addConfiguration(adv.configuration, body);

      body.tag('master').text(gen.config.master);
      opt.option && opt.option.mode && body.tag('mode').text(opt.option.mode);
      body.tag('name').text(gen.config.name);
      body.tag('class').text(gen.config.class);
      body.tag('jar').text(gen.config.jar);

      opt.option && opt.option['spark-opts'] && body.tag('spark-opts').text(opt.option['spark-opts']);
      [ 'arg', 'file', 'archive' ].forEach(k => adv[k] && adv[k].forEach(t => body.tag(k).text(t)));
    }, {
      jobTracker: true,
      nameNode: true
    });
  }

  hive2(r, v) {
    return this._action(r, v, body => {
      const { general: gen, advanced: adv } = v.props,
            w = gen.config.hiveOption;

      body.prop('xmlns', 'uri:oozie:hive2-action:0.2');

      this._addPrepare(adv.prepare, body);
      this._addConfiguration(adv.configuration, body);
      
      body.tag('jdbc-url').text(gen.config['jdbc-url']);
      gen.config.password && body.tag('password').text(gen.config.password);
      body.tag(w).text(gen[w][w]);

      [ 'param', 'argument', 'file', 'archive' ].forEach(k => adv[k] && adv[k].forEach(t => body.tag(k).text(t)));
    }, {
      jobTracker: true,
      nameNode: true
    });
  }

  // for reuse
  _addPrepare(args, body) {
    if(!args || !args.length) return;
    const prepare = body.tag('prepare');
    let cmd = null;
    args.forEach((o, i) => {
      cmd = prepare.tag(`${o.key}!${i}`);
      Object.keys(o.values).forEach(k => cmd.prop(k, o.values[k]));
    });
  }

  _addConfiguration(args, body) {
    if(!args || !args.length) return;
    const configuration = body.tag('configuration');
    let property = null;
    args.forEach(o => {
      property = configuration.tag('property');
      Object.keys(o).forEach(k => property.tag(k).text(o[k]));
    });
  }
}