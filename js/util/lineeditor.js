const MARGIN_WIDTH = 32;

let instance = null,
    cbDone = null,
    cbCancel = null,
    cancel = false;

export default class LineEditor {
    constructor() {
        if(instance) return instance;

        instance = this;
        this.el = document.createElement('div');
        this.el.className = 'frappe-textinput';
        this.el.contentEditable = 'true';
        this.el.addEventListener('blur', () => this.hide());
        this.el.addEventListener('keydown', e => this.checkKeys(e));
        this.el.addEventListener('keyup', () => this.fit(true));

        this._p = document.createElement('div');
        this._p.className = 'frappe-textinput';
        this._p.style.display = 'block';
        this._p.style.opacity = '0';
    }

    get text() { return this.el.innerText; }
    set text(s) { this.el.innerHTML = s; }

    show(x, y, text, deg, scale, done, cancel) {
        document.body.appendChild(this.el);
        this.text = text || ' ';
        this.fit();
        
        this.el.style.display = 'block';
        
        const width = this.el.offsetWidth, height = this.el.offsetHeight;
        this.el.style.left = x - width/2;
        this.el.style.top = y - height/2;
        this.el.style.transform = `rotate(${deg||0}deg) scale(${scale||1})`;
        this.el.focus();

        // select all
        const rng = document.createRange(), sel = window.getSelection();
        rng.selectNodeContents(this.el);
        sel.removeAllRanges();
        sel.addRange(rng);

        cbDone = done;
    }

    hide() {
        this.el.display = '';
        this.el.parentElement && this.el.parentElement.removeChild(this.el);
        cbDone(cancel);
        cancel = false;
    }

    fit(align) {
        const oX = parseInt(this.el.style.left), oW = parseInt(this.el.style.width);

        this._p.innerHTML = this.text;
        document.body.appendChild(this._p);
        this.el.style.width = (this._p.offsetWidth + MARGIN_WIDTH) + 'px';
        align && (this.el.style.left = oX + (oW - this._p.offsetWidth - MARGIN_WIDTH)/2);
        document.body.removeChild(this._p);
    }

    checkKeys(e) {
        if(e.ctrlKey || e.metaKey || e.key=='Enter' || e.keyCode == 13) e.preventDefault();
        if(e.key=='Escape' || e.keyCode=='27') {
            cancel = true;
            this.el.blur();
        }
    }
}