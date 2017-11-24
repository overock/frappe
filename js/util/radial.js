import actionDef from '../defs/action';
import SVG from './svg';

let instance = null;

export default class RadialMenu {
    constructor() {
        if(instance) return instance;

        this.icons = {};
        this.element = null;

        Object.keys(actionDef).forEach(k => {
            const icon = this.icons[k] = SVG.build(actionDef[k].markup);
            icon.classList.add('frappe-branch-confirm');
            icon.style.width = '40px';
            icon.style.height = '40px';
            icon.setAttribute('data-actiontype', k);
        });

        instance = this;
    }

    open(target, cx, cy, items) {
        this.element = SVG.create('g');
        const n = items.length, th = Math.PI*2/n, r = 24 / Math.tan(th/2) + 12, ts = new Date();
        const activeItems = items.map((k, i) => {
            const ret = {
                ox: cx,
                oy: cy,
                dx: cx + r*Math.cos(i*th),
                dy: cy + r*Math.sin(i*th),
                element: this.icons[k]
            };
    
            ret.element.setAttribute('x', cx);
            ret.element.setAttribute('y', cy);

            this.element.appendChild(ret.element);

            return ret;
        });
        const doAnim = () => {
            const diff = Math.min(Math.pow((new Date() - ts)/250, 3), 1);

            activeItems.forEach(v => {
                v.element.setAttribute('x', v.ox*(1-diff) + v.dx*diff);
                v.element.setAttribute('y', v.oy*(1-diff) + v.dy*diff);
            });

            diff==1 || requestAnimationFrame(doAnim);
        };

        target.appendChild(this.element);

        doAnim();
    }

    close() {
        this.element.parentNode.removeChild(this.element);
        this.element = null;
    }
}