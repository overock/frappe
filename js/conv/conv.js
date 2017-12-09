import In from './import';
import Out from './export';

import Node from '../util/node';
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
    const ret = new Node({}).prop({ name: pool.title, xmlns: 'uri:oozie:workflow:0.4' }),
          out = new Out(),
          proc = v => out[v.type](ret, v);
    pool.container.filter(v => v.type == 'start').forEach(proc);
    pool.container.filter(v => !v.isFlow && [ 'start', 'end', 'kill' ].indexOf(v.type) == -1).forEach(proc);
    pool.container.filter(v => v.type == 'kill').forEach(proc);
    pool.container.filter(v => v.type == 'end').forEach(proc);
    return ret;
  }
}