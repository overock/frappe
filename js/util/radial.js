import actionDef from '../defs/action';
import SVG from './svg';

let instance = null;

export default class RadialMenu {
  constructor() {
    if(instance) return instance;

    this.icons = {};
    this.element = SVG.create('g');

    Object.keys(actionDef).forEach(k => {
      this.icons[k] = SVG.create('circle', null, {
        'class': 'frappe-branch-confirm',
        'r': 20,
        'data-actiontype': k,
        'fill': `url(#radialIcon_${k})`,
        'filter': 'url(#actionRadial)'
      });
    });

    instance = this;
  }

  open(target, cx, cy, items) {
    const n = items.length,
          th = Math.PI * 2 / n,
          r = 24 / Math.tan(th / 2),
          ts = new Date(),
          activeItems = items.map((k, i) => {
            const ret = {
              ox: cx,
              oy: cy,
              dx: cx + r * Math.cos(i * th),
              dy: cy + r * Math.sin(i * th),
              el: this.icons[k]
            };

            ret.el.setAttribute('cx', cx);
            ret.el.setAttribute('cy', cy);

            this.element.appendChild(ret.el);

            return ret;
          }),
          doAnim = () => {
            const diff = Math.min(Math.pow((new Date() - ts) / 250, 3), 1);

            activeItems.forEach(v => {
              v.el.setAttribute('cx', v.ox * (1 - diff) + v.dx * diff);
              v.el.setAttribute('cy', v.oy * (1 - diff) + v.dy * diff);
            });

            diff == 1 || requestAnimationFrame(doAnim);
          };

    target.appendChild(this.element);
    requestAnimationFrame(doAnim);
  }

  close() {
    this.element.parentNode.removeChild(this.element);
    this.element.innerHTML = '';
  }
}