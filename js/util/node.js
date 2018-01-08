// not a robust class. use at your own risk
export default class Node {
  constructor(o, p) {
    if(o instanceof Node) {
      p && this.parent || Object.defineProperty(o, 'parent', { value: p });
      return o;
    } else if(o instanceof Array) {
      return o.map(e => new Node(e, p));
    } else if(o instanceof Object) {
      this.merge(o);
      p && this.parent || Object.defineProperty(this, 'parent', { value: p });
    }
  }

  _stringify(v) { return v? v+'' : v===0? 0 : ''; }

  tags(t) {
    if([ '@', '#', '!' ].indexOf(t[0]) >= 0) return;
    const ret = this[t];
    return (ret instanceof Array && ret.length == 1) ? ret[0] : ret;
  }

  add(k, v) {
    return k[0] == '@' ? this.prop(k.slice(1), v) : k[0] == '#' ? this.text(v) : k[0] == '!' ? this.option(k, v) : this.tag(k, v);
  }

  merge(o) { Object.keys(o).forEach(k => o.hasOwnProperty(k) && this.add(k, o[k])); }

  tag(t, c) {
    if(c instanceof Array) {
      return c.forEach(v => this.add(t, v)), this[t][this[t].length - 1];
    } else {
      const o = new Node(c, this);
      !this[t] ? (this[t] = o) : this[t] instanceof Array ? this[t].push(o) : (this[t] = [ this[t] ]).push(o);
      return o;
    }
  }

  prop(k, v) {
    if(typeof k == 'object') {  // batch
      Object.keys(k).forEach(kk => this.prop(kk, k[kk]));
    } else if(arguments.length == 1) {  // getter
      return this['@' + k] || '';
    } else if(arguments.length == 2) {  // setter
      this['@' + k] = this._stringify(v);
    }

    return this;
  }

  text(v) { return typeof v == 'undefined' ? this['#text'] || '' : (this['#text'] = this._stringify(v)), this; }

  option(k, v) {
    if(typeof k == 'object') {  // batch
      Object.keys(k).forEach(kk => this.option(kk, k[kk]));
    } else if(arguments.length == 1) {  // getter
      return this['!' + k] || '';
    } else if(arguments.length == 2) {  // setter
      this['!' + k] = this._stringify(v);
    }

    return this;
  }
}