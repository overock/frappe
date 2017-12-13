import ModelFactory from '../main/modelfactory';
import Converter from '../conv/conv';

let instance = null;

export default class ModelPool {
  constructor() {
    if(instance) return instance;

    this.container = [];
    this.title = '';

    instance = this;
  }

  get ids() { return this.container.map(v => v.uuid); }
  indexOf(uuid) { return this.ids.indexOf(uuid); }
  item(uuid) { return this.container[this.ids.indexOf(uuid)]; }

  add(model) {
    if(typeof model == 'string') model = ModelFactory.create(model);
    !model.name && (model.name = this.name(model));
    this.container.push(model);
    return model;
  }

  remove(model) {
    if(typeof model == 'string') model = this.item(model);
    if(!model) return;

    model.isFlow || model.links.forEach(v => this.remove(v));
    model.unlinkAll();

    let i = this.indexOf(model.uuid);
    i >= 0 && this.container.splice(i, 1);

    model.remove();
  }

  clear() {
    this.container.forEach(v => v.remove());
    this.container = [];
  }

  name(model) {
    const tag = model.type;
    if(tag == 'flow') return;
    if([ 'start', 'end', 'kill' ].indexOf(tag) >= 0) return tag;

    let i = 1;
    while(this.find(m => m.name == `${tag}_${i}`)) ++i;
    
    return `${tag}_${i}`;
  }

  import (json) {
    Converter.import(this, json);
    this.render();
  }
  export () { return Converter.export(this); }

  render(canvas, callback) {
    this.container.forEach(m => {
      if(canvas && !canvas.contains(m.element)) {
        m.isFlow? canvas.insertBefore(m.element, canvas.firstElementChild) : canvas.appendChild(m.element);
        callback && callback(m);
      }
      m.render();
    });
  }

  // rulecheckers
  // TODO: 인덱스랑 오류 원인도 리턴을 해 줘야 하는 거 아닌강;;
  check(phase) {
    return this.reduce((p, m) => {
      const ret = m.rules[phase](m, this);
      ret &&(p = p.concat(ret));
    }, []);
  }
  onSave() { this.check('onSave'); }

  onExecute() { this.check('onExecute'); }

  // some iterator proxies
  filter(fn) { return this.container.filter(fn); }
  find(fn) { return this.container.find(fn); }
  map(fn) { return this.container.map(fn); }
  some(fn) { return this.container.some(fn); }
  reduce(fn, init) { return this.container.reduce(fn, init); }
}