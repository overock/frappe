import ElAssist from './elassist';

const MARGIN_WIDTH = 32;

let instance = null,
    callbackFn = null,
    isCancelled = false,
    center = undefined;

export default class LineEditor {
  constructor() {
    if(instance) return instance;

    instance = this;
    this.input = document.createElement('input');
    this.input.className = 'frappe-textinput';
    this.input.setAttribute('type', 'text');
    this.input.addEventListener('focus', () => this.fit());
    this.input.addEventListener('blur', e => this.onBlur(e));
    this.input.addEventListener('keydown', e => this.checkKeys(e));
    this.input.addEventListener('keyup', () => this.fit());

    this.holder = document.createElement('div');
    this.holder.className = 'frappe-textinput-holder';
    this.holder.appendChild(this.input);
    
    this._p = document.createElement('div');
    this._p.className = 'frappe-textinput frappe-textinput-shadow';

    this.elAssist = new ElAssist(this.input);
    this.elAssist.excludeNS('coord');
  }

  get text() { return this.input.value; }
  set text(s) { this.input.value = s; }

  show(x, y, options, callback) {
    const { text = '', scale = 1 } = options;
    //const { text = '', deg = 0, scale = 1 } = options;

    this.elAssist.hideItems();

    center = x;
    document.body.appendChild(this.holder);
    this.text = text || '';

    this.holder.style.top = (y - this.holder.offsetHeight/2) + 'px';
    this.holder.style.transform = `scale(${scale||1})`;
    //this.holder.style.transform = `rotate(${deg||0}deg) scale(${scale||1})`;
    
    this.input.focus();
    this.input.select();
    this.fit();
    callbackFn = callback;
  }

  hide() {
    if(!callbackFn(isCancelled)) {
      this.anim = {
        ts: new Date(),
        iX: this.holder.offsetLeft
      };
      requestAnimationFrame(() => this.shake());
      return;
    }

    this.holder.parentElement && this.holder.parentElement.removeChild(this.holder);
    
    isCancelled = false;
  }

  shake() {
    const delta = new Date() - this.anim.ts;
    if(delta>500) {
      this.input.focus();
      this.input.select();
      return;
    }

    const offset = Math.sin(delta/20) * Math.sin(delta/500*Math.PI) * 4;
    this.holder.style.left = (this.anim.iX + offset) + 'px';
    requestAnimationFrame(() => this.shake());
  }

  fit() {
    document.body.appendChild(this._p);
    this._p.innerHTML = this.text;
    this.input.style.width = (this._p.offsetWidth + MARGIN_WIDTH) + 'px';
    this.holder.style.left = (center - this.input.offsetWidth / 2) + 'px';
    document.body.removeChild(this._p);
  }

  onBlur() {
    setTimeout(() => {
      if(this.elAssist.itemSelected) {
        this.input.focus();
        this.fit();
      } else {
        this.hide();
      }
    }, 167);
  }

  checkKeys(e) {
    switch(e.key || e.keyCode) {
      case 'Enter':
      case '13':
        if(this.elAssist.isActive) return;
        e.preventDefault();
        this.input.blur();
        break;
      case 'Escape':
      case '27':
        isCancelled = true;
        this.input.blur();
        break;
    }
  }
}