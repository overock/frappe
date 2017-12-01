const MARGIN_WIDTH = 32;

let instance = null,
    cbDone = null,
    cancel = false,
    center = undefined;

export default class LineEditor {
    constructor() {
        if(instance) return instance;

        instance = this;
        this.el = document.createElement('div');
        this.el.className = 'frappe-textinput';
        this.el.contentEditable = 'true';
        this.el.addEventListener('blur', () => this.hide());
        this.el.addEventListener('keydown', e => this.checkKeys(e));
        this.el.addEventListener('keyup', () => this.fit());

        this._p = document.createElement('div');
        this._p.className = 'frappe-textinput';
        this._p.style.display = 'block';
        this._p.style.opacity = '0';
    }

    get text() { return this.el.innerText; }
    set text(s) { this.el.innerHTML = s; }

    show(x, y, text, deg, scale, done, cancel) {
        center = x;
        document.body.appendChild(this.el);
        this.text = text || '';
        
        this.el.style.display = 'block';
        this.el.style.top = (y - this.el.offsetHeight/2) + 'px';
        this.el.style.transform = `rotate(${deg||0}deg) scale(${scale||1})`;
        this.el.focus();

        this.fit();
        
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

    fit() {
        document.body.appendChild(this._p);
        this._p.innerHTML = this.text;
        this.el.style.width = (this._p.offsetWidth + MARGIN_WIDTH) + 'px';
        this.el.style.left = (center - this.el.offsetWidth/2) + 'px';
        document.body.removeChild(this._p);
    }

    checkKeys(e) {
        if(e.ctrlKey || e.metaKey) {
            e.preventDefault();
            return;
        }

        switch(e.key || e.keyCode) {
            case 'Enter': case '13':
                e.preventDefault();
                this.el.blur();
                break;
            case 'Escape': case '27':
                cancel = true;
                this.el.blur();
                break;
        }
    }
}