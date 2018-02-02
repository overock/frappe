import ModelFactory from './main/modelfactory';
import Event from './main/event';
import MdPool from './model/pool';
import SVG from './util/svg';
import RadialMenu from './util/radial';
import actionDef from './defs/action';
//import uuid from './util/uuid';

let instance = null;
const listeners = {};

export default class Frappe {
  constructor(parent, width, height) {
    if(instance) {
      parent.appendChild(instance.canvas);
      instance.canvas.style.width = width || '100%';
      instance.canvas.style.height = height || '100%';
      return instance;
    }

    instance = this;

    this.canvas = SVG.create('svg');
    this.canvas.classList.add('frappe-canvas');
    //this.canvas.id = this.id = uuid();
    this.canvas.setAttribute('preserveAspectRatio', 'xMinYMin slice');
    this.canvas.style.width = width || '100%';
    this.canvas.style.height = height || '100%';

    [ 'marker', 'actionHandle', 'actionRemove', 'flowHandle', 'normMatrix', 'radialMatrix', 'warnMatrix', 'errMatrix' ]
      .forEach(v => this.defs.appendChild(SVG[v]));

    
    Object.keys(actionDef).forEach(k => {
      const icon = SVG.build(actionDef[k].markup);
      icon.setAttribute('width', 40);
      icon.setAttribute('height', 40);

      this.defs.appendChild(SVG.create('pattern', icon, {
        id: `radialIcon_${k}`,
        width: 40,
        height: 40
      }));
    });

    parent.appendChild(this.canvas);

    this.pool = new MdPool();
    this.event = new Event();
    this.radial = new RadialMenu();

    this.event.bind(this);

    // flush & register observers
    this.unsubscribeAll();
    const evts = {
      'keydown': this.event.hotKeys,

      'frappe.add': e => this.add(e.detail.type, e.detail.top, e.detail.left, e.detail.bottom, e.detail.right),
      'frappe.remove': e => this.remove(e.detail.model),
      'frappe.clear': e => this.clear(),
      'frappe.link': e => this.link(e.detail.src, e.detail.dest),
      'frappe.replace': e => this.replace(e.detail.src, e.detail.dest),
      'frappe.render': () => this.render(),

      'frappe.canvasdrag': e => this.setViewbox(e.detail),
      'frappe.canvaszoom': e => this.setZoom(e.detail),

      'frappe.newaction': e => this.addNewAction(e.detail),

      'frappe.branchstart': e => this.addGhost(e.detail),
      'frappe.checkarea': e => this.checkArea(e.detail),
      'frappe.branchend': e => this.confirmGhost(e.detail),
      'frappe.branchconfirm': e => this.removeGhost(e.detail),

      'frappe.snapstart': e => this.addGhostSnap(e.detail),
      'frappe.snapend': e => this.confirmGhostSnap(e.detail),
      'frappe.snapconfirm': e => this.removeGhostSnap(e.detail),

      'frappe.import': e => this.pool.import(e.detail),
      'frappe.export': () => this.pool.export() // 이렇게 해서 export 결과는 어떻게 받을건데??
    };
    Object.keys(evts).forEach(k => this.subscribe(k, evts[k]));

    this.heartBeat();
  }

  destroy() {
    this.unsubscribeAll();
    this.canvas.parentNode && this.canvas.parentNode.removeChild(this.canvas);
    instance = null;
  }

  heartBeat() {
    if(document.body.contains(this.canvas)) {
      // check resize
      const z = this.event.viewBox.z,
            {
              width,
              height
            } = this.metric,
            [ x, y, w, h ] = this.canvas.getAttribute('viewBox').split(' ').map(v => v | 0);

      if(height != h || width != w) {
        const viewbox = `${x} ${y} ${width/z} ${height/z}`;
        this.canvas.setAttribute('viewBox', viewbox);
        this.event.viewBox = viewbox;
      }
      requestAnimationFrame(() => this.heartBeat());
    } else {
      this.destroy();
    }
  }

  /**
   * canvas handling
   */
  get metric() { return this.canvas.getBoundingClientRect(); }

  resize() {
    const z = this.event.viewBox.z,
          {
            width,
            height
          } = this.metric,
          [ x, y ] = this.canvas.getAttribute('viewBox').split(' ').map(v => v | 0),
          viewbox = `${x} ${y} ${width/z} ${height/z}`;

    this.canvas.setAttribute('viewBox', viewbox);
    this.event.viewBox = viewbox;
  }

  get defs() {
    return this.canvas.querySelector('defs') || this.canvas.appendChild(SVG.create('defs'));
  }

  /**
   * core functions
   */

  add(model, top, left, bottom, right) {
    if(typeof model == 'string') model = ModelFactory.create(model, top, left, bottom, right);

    this.pool.add(model);
    this.render();

    return model;
  }

  remove(model) {
    this.pool.remove(model.id);
    model.element.parentNode && this.canvas.removeChild(model.element);
    this.render();
  }

  clear() {
    this.pool.clear();
    this.render();
  }

  link(src, dest) {
    if(!src.isFlow && !dest.isFlow) {
      let bridge = this.add('flow');
      bridge.linkAfter(src);
      dest.linkAfter(bridge);
    } else if(src.isFlow ^ dest.isFlow) {
      dest.linkAfter(src);
    }

    this.render(true);
  }

  replace(oldModel, type) {
    const newModel = this.add(type);

    ({
      top: newModel.top,
      left: newModel.left
    } = oldModel);
    oldModel.prev.forEach(p => this.link(p, newModel));
    oldModel.next.forEach(n => this.link(newModel, n));
    this.remove(oldModel);
    this.render(true);

    return newModel;
  }

  render(bUpdateOnly) {
    this.pool.render(bUpdateOnly ? undefined : this.canvas, model => this.event.listen(model));
    this.emit('frappe.change');

    // this.__timeout && clearTimeout(this.__timeout);
    // this.__updateOnly = this.__updateOnly && bUpdateOnly;
    // this.__timeout = setTimeout(() => this._render(this.__updateOnly), 16);
  }

  // _render(bUpdateOnly) {
  //   this.pool.render(bUpdateOnly ? undefined : this.canvas, model => this.event.listen(model));
  //   this.emit('frappe.change');

  //   this.__timeout = null;
  //   this.__updateOnly = true;
  // }

  import (json) {
    typeof json == 'string' && (json = JSON.parse(json));
    this.pool.import(json);
    this.render();
  }
  export () { return this.pool.export(); }

  /**
   * event emitters to interact event.js or any other modules
   */
  emit(type, param) { return window.dispatchEvent(new CustomEvent(type, { detail: param })); }

  subscribe(type, fn) {
    const pool = listeners[type] || (listeners[type] = []);

    this.unsubscribe(type, fn);
    pool.push(fn);

    return window.addEventListener(type, fn);
  }

  unsubscribe(type, fn) {
    const p = listeners[type],
          idx = p.findIndex(v => v == fn);

    idx >= 0 && p.splice(idx, 1);
    return window.removeEventListener(type, fn);
  }

  unsubscribeAll() { Object.keys(listeners).forEach(type => listeners[type].forEach(fn => this.unsubscribe(type, fn))); }

  setViewbox(d) {
    const { x, y, w, h } = d.viewBox;
    this.canvas.setAttribute('viewBox', `${x} ${y} ${w} ${h}`);
  }

  setZoom(d) {
    const {
            width: cw,
            height: ch
          } = this.metric,
          {
            viewBox: v,
            originalEvent: e
          } = d,
          offset = 1 / v.z - 1 / (v.z = Math.min(Math.max(0.25, v.z - e.deltaY / 500), 2));

    v.x += offset * e.layerX, v.y += offset * e.layerY, v.w = cw / v.z, v.h = ch / v.z;

    const {
      x,
      y,
      w,
      h
    } = v;
    this.canvas.setAttribute('viewBox', `${x} ${y} ${w} ${h}`);
  }

  addNewAction(d) {
    const {
            type,
            top,
            left
          } = d,
          [ vx, vy, vw ] = this.canvas.getAttribute('viewBox').split(' ').map(v => v | 0),
          ratio = vw / this.metric.width;

    this.add(type, top * ratio + vy, left * ratio + vx);
  }

  addGhost(d) {
    const p = d.props,
          ga = ModelFactory.createGhost('ghost', p.top, p.left),
          gf = ModelFactory.createGhost('flow');

    [ p.ghostAction, p.ghostFlow ] = [ ga, gf ];

    this.link(p.from, gf);
    this.link(gf, ga);
    ga.render();
    gf.render();
    this.canvas.appendChild(ga.element);
    this.canvas.appendChild(gf.element);
  }

  checkArea(d) {
    let {
          from: lnFrom,
          to: lnTo,
          ghostAction: ga,
          ghostFlow: gf,
          left: x,
          top: y
        } = d.props;
    
    x += 32, y += 32;
    let hover = this.pool.filter(m => m != lnFrom && !m.isFlow && !lnFrom.isConnectedTo(m))
                      .find(m => m.top <= y && m.left <= x && m.bottom >= y && m.right >= x);
    
    hover && hover.rules.maxFrom<=hover.prevActions.length && (hover = null);
    
    if(lnTo != hover) { // switch link mode
      ga.element.style.visibility = hover ? 'hidden' : '';
      d.props.to = hover || null;
    }

    lnTo ? { top: ga.top, left: ga.left, width: ga.width, height: ga.height } = lnTo : [ ga.width, ga.height ] = [ 64, 64 ];

    ga.render();
    gf.render();
  }

  confirmGhost(d) {
    const {
            props: {
              ghostAction: ga,
              ghostFlow: gf,
              from: lnFrom,
              to: lnTo,
              top: y,
              left: x
            },
            listener: fn
          } = d;

    if(lnTo) {
      gf.unlinkAll();
      this.link(lnFrom, lnTo);

      this.canvas.removeChild(ga.element);
      this.canvas.removeChild(gf.element);
    } else {
      this.radial.open(this.canvas, x + 32, y + 32, lnFrom.rules.after);
      this.canvas.addEventListener('mousedown', fn);
    }
  }

  removeGhost(d) {
    const {
            props: {
              from: target,
              ghostAction: ga,
              ghostFlow: gf
            },
            type: type,
            listener: fn,
            confirmed: c
          } = d;

    gf.unlinkAll();
    c && this.link(target, this.replace(ga, type));

    this.remove(ga);
    this.remove(gf);
    this.canvas.removeEventListener('mousedown', fn);
    this.radial.close();
  }

  addGhostSnap(d) {
    const p = d.props,
          ga = ModelFactory.createGhost('ghost', p.top, p.left),
          gf1 = ModelFactory.createGhost('flow'),
          gf2 = ModelFactory.createGhost('flow');

    [ p.ghostAction, p.ghostFlow, p.ghostFlow2 ] = [ ga, gf1, gf2 ];

    this.link(p.from.prev[0], gf1);
    this.link(gf1, ga);
    this.link(ga, gf2);
    this.link(gf2, p.from.next[0]);
    ga.render();
    gf1.render();
    gf2.render();
    this.canvas.appendChild(ga.element);
    this.canvas.appendChild(gf1.element);
    this.canvas.appendChild(gf2.element);
    p.from.element.style.display = 'none';
  }

  confirmGhostSnap(d) {
    const {
            props: { from: lnFrom, top: y, left: x },
            listener: fn
          } = d,
          pList = lnFrom.prev[0].rules.after,
          nList = lnFrom.next[0].rules.before;

    this.radial.open(this.canvas, x + 32, y + 32, pList.filter(v => nList.indexOf(v) >= 0));
    this.canvas.addEventListener('mousedown', fn);
  }

  removeGhostSnap(d) {
    const {
            props: {
              from: target,
              ghostAction: ga,
              ghostFlow: gf1,
              ghostFlow2: gf2
            },
            type: type,
            listener: fn,
            confirmed: c
          } = d;

    gf1.unlinkAll();
    gf2.unlinkAll();

    if(c) {
      const newMd = this.replace(ga, type),
            flow = this.add('flow'),
            order = target.order;

      this.link(newMd, target.next[0]);
      this.link(target.prev[0], flow);
      this.link(flow, newMd);
      this.remove(target);
      flow.order = order;
    }

    this.remove(ga);
    this.remove(gf1);
    this.remove(gf2);
    this.canvas.removeEventListener('mousedown', fn);
    this.radial.close();
    target.element.style.display = '';
  }
}

window.Frappe = Frappe;