import actionDef from '../defs/action';
import SVG from './svg';

let instance = null;

export default class RadialMenu {
    constructor(defs) {
        if(instance) return instance;

        this.icons = {};
        this.element = null;

        Object.keys(actionDef).forEach(k => {
            const icon = SVG.build(actionDef[k].markup);
            icon.setAttribute('width', 40);
            icon.setAttribute('height', 40);

            defs.appendChild(SVG.create('pattern', icon, { id: `radialIcon_${k}`, width: 40, height: 40 }));

            this.icons[k] = SVG.create('circle', null, {
                'class': 'frappe-branch-confirm',
                'r': 20,
                'data-actiontype': k,
                'fill': `url(#radialIcon_${k})`
            });
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
    
            ret.element.setAttribute('cx', cx);
            ret.element.setAttribute('cy', cy);

            this.element.appendChild(ret.element);

            return ret;
        });
        const doAnim = () => {
            const diff = Math.min(Math.pow((new Date() - ts)/250, 3), 1);

            activeItems.forEach(v => {
                v.element.setAttribute('cx', v.ox*(1-diff) + v.dx*diff);
                v.element.setAttribute('cy', v.oy*(1-diff) + v.dy*diff);
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