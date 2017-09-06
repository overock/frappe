import ModelFactory from './main/modelfactory';
import Event from './main/event';
import MdPool from './model/pool';
import SVG from './util/svg';
import RadialMenu from './util/radial';

export default class Frappe {
    constructor(parent, width, height) {
        this.pool = new MdPool();
        this.event = new Event();
        this.radial = new RadialMenu();

        this.canvas = SVG.create('svg');
        this.canvas.setAttribute('preserveAspectRatio', 'xMinYMin slice');
        this.canvas.style.width = width || '100%';
        this.canvas.style.height = height || '100%';

        this.canvas.appendChild(SVG.marker);
        this.canvas.appendChild(SVG.actionHandle);
        this.canvas.appendChild(SVG.flowHandle);

        parent.appendChild(this.canvas);
        this.event.bind(this);

        // register observers
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('frappe.add', e => this.add(e.detail.type, e.detail.top, e.detail.left, e.detail.bottom, e.detail.right));
        window.addEventListener('frappe.remove', e => this.remove(e.detail.id));
        window.addEventListener('frappe.link', e => this.link(e.detail.src, e.detail.dest));
        window.addEventListener('frappe.replace', e => this.replace(e.detail.src, e.detail.dest));
        window.addEventListener('frappe.render', () => this.render());

        window.addEventListener('frappe.canvasdrag', e => this.setViewbox(e.detail));
        window.addEventListener('frappe.canvaszoom', e => this.setZoom(e.detail));

        window.addEventListener('frappe.newaction', e => this.addNewAction(e.detail));

        window.addEventListener('frappe.branchstart', e => this.addGhost(e.detail));
        window.addEventListener('frappe.checkarea', e => this.checkArea(e.detail));
        window.addEventListener('frappe.branchend', e => this.confirmGhost(e.detail));
        window.addEventListener('frappe.branchconfirm', e => this.removeGhost(e.detail));

        window.addEventListener('frappe.snapstart', e => this.addGhostSnap(e.detail));
        window.addEventListener('frappe.snapend', e => this.confirmGhostSnap(e.detail));
        window.addEventListener('frappe.snapconfirm', e => this.removeGhostSnap(e.detail));

        window.addEventListener('frappe.import', e => this.import(e.detail));
        window.addEventListener('frappe.export', () => this.export());  // 이렇게 해서 export 결과는 어떻게 받을건데??
    }

    /**
     * canvas size & viewport
     */
    get metric() { return this.canvas.getBoundingClientRect(); }

    resize() {
        // TODO: chrome에서는 렌더링 이슈가 있어 부득이하게 timeout 걸어둠.
        // 이후 코드를 분기했으면 한다.
        clearTimeout(this.__delayed__);
        this.__delayed__ = setTimeout(() => {
            const
                z = this.event.viewBox.z,
                { width, height } = this.metric,
                [ x, y ] = this.canvas.getAttribute('viewBox').split(' ').map(v => v|0),
                viewbox = `${x} ${y} ${width/z} ${height/z}`;
            
            setTimeout(() => this.canvas.setAttribute('viewBox', viewbox), 133);
            this.event.viewBox = viewbox;
        }, 133);
    }
    
    /**
     * core functions
     */

    add(model, top, left, bottom, right) {
        if(typeof model=='string') model = ModelFactory.create(model, top, left, bottom, right);

        this.pool.add(model);
        if(model.isFlow) {
            this.canvas.insertBefore(model.element, this.canvas.firstElementChild);
        } else {
            this.canvas.appendChild(model.element);
        }
        this.event.listen(model);
        this.render();

        return model;
    }

    remove(model) {
        this.pool.remove(model.uuid);
        model.element.parentNode && this.canvas.removeChild(model.element);
    }

    link(src, dest) {
        if(!src.isFlow && !dest.isFlow) {
            let bridge = this.add('flow');
            bridge.linkAfter(src);
            dest.linkAfter(bridge);
        } else if(src.isFlow^dest.isFlow) {
            dest.linkAfter(src);
        }

        this.render();
    }

    replace(oldModel, type) {
        const newModel = this.add(type);
        
        ({ top: newModel.top, left: newModel.left } = oldModel);
        oldModel.prev.forEach(p => this.link(p, newModel));
        oldModel.next.forEach(n => this.link(newModel, n));
        this.remove(oldModel);
        this.render();

        return newModel;
    }

    render() { this.pool.render(); }

    /**
     * event emitters to interact event.js or any other modules
     */
    emit(type, param) {
        return window.dispatchEvent(new CustomEvent(type, { detail: param }));
    }

    setViewbox(d) {
        const { x, y, w, h } = d.viewBox;
        this.canvas.setAttribute('viewBox', `${x} ${y} ${w} ${h}`);
    }

    setZoom(d) {
        const
            { width: cw, height: ch } = this.metric,
            { viewBox: v, originalEvent: e } = d,
            offset = 1/v.z - 1/(v.z = Math.min(Math.max(0.25, v.z - e.deltaY/500), 2));

        v.x += offset*e.layerX, v.y += offset*e.layerY, v.w = cw/v.z, v.h = ch/v.z;

        const { x, y, w, h } = v;
        this.canvas.setAttribute('viewBox', `${x} ${y} ${w} ${h}`);
    }

    addNewAction(d) {
        const
            { type, top, left } = d,
            [ vx, vy, vw ] = this.canvas.getAttribute('viewBox').split(' ').map(v => v|0),
            ratio = vw / this.metric.width;
        
        this.add(type, top*ratio + vy, left*ratio + vx);
    }

    addGhost(d) {
        const
            p = d.props,
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
        const
            { viewBox: v, props: p, originalEvent: e } = d,
            { from: lnFrom, to: lnTo, ghostAction: ga, ghostFlow: gd } = p,
            x = v.x + e.layerX/v.z,
            y = v.y + e.layerY/v.z,
            hover = this.pool
                .filter(m => m!=lnFrom && !m.isFlow && !lnFrom.isAdjacentTo(m) && !lnFrom.isMakingCircuit(m))
                .find(m => m.top<=y && m.left<=x && m.bottom>=y && m.right>=x);
        if(lnTo!=hover) {   // switch link mode
            ga.element.style.visibility = hover? 'hidden' : '';
            p.to = hover || null;
        }

        lnTo? { top: ga.top, left: ga.left, width: ga.width, height: ga.height } = lnTo
            : [ ga.width, ga.height ] = [64, 64];   // 임시방편같다;;

        ga.render();
        gd.render();
    }

    confirmGhost(d) {
        const {
            props: { ghostAction: ga, ghostFlow: gf, from: lnFrom, to: lnTo, top: y, left: x },
            listener: fn
        } = d;

        if(lnTo) {
            gf.unlinkAll();
            this.link(lnFrom, lnTo);

            this.canvas.removeChild(ga.element);
            this.canvas.removeChild(gf.element);
        } else {
            this.radial.open(this.canvas, x, y, lnFrom.rules.after);
            this.canvas.addEventListener('mousedown', fn);
        }
    }

    removeGhost(d) {
        const {
            props: { from: target, ghostAction: ga, ghostFlow: gf },
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
        const
            p = d.props,
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
        } = d;

        //TODO: 생각해 보니 snap은 before/after에 대한 intersect를 받아야 함. 끄응...
        this.radial.open(this.canvas, x, y, lnFrom.prev[0].rules.after);
        this.canvas.addEventListener('mousedown', fn);
    }

    removeGhostSnap(d) {
        const {
                props: { from: target, ghostAction: ga, ghostFlow: gf1, ghostFlow2: gf2 },
                type: type,
                listener: fn,
                confirmed: c
            } = d, newMd = this.replace(ga, type);

        gf1.unlinkAll();
        gf2.unlinkAll();

        if(c) {
            this.link(newMd, target.next[0]);
            this.link(target, newMd);
        }

        this.remove(ga);
        this.remove(gf1);
        this.remove(gf2);
        this.canvas.removeEventListener('mousedown', fn);
        this.radial.close();
        target.element.style.display = '';
    }
}
