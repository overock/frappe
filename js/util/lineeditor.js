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
    this.input.addEventListener('blur', () => this.hide());
    this.input.addEventListener('keydown', e => this.checkKeys(e));
    this.input.addEventListener('keyup', () => this.fit());
    
    this._p = document.createElement('div');
    this._p.className = 'frappe-textinput';
    this._p.style.display = 'block';
    this._p.style.opacity = '0';
  }

  get text() { return this.input.value; }
  set text(s) { this.input.value = s; }

  show(x, y, options, callback) {
    const { text = '', deg = 0, scale = 1 } = options;
    center = x;
    document.body.appendChild(this.input);
    this.text = text || '';

    this.input.style.display = 'block';
    this.input.style.top = (y - this.input.offsetHeight / 2) + 'px';
    this.input.style.transform = `rotate(${deg||0}deg) scale(${scale||1})`;

    this.input.focus();
    this.input.select();
    this.fit();
    callbackFn = callback;
  }

  hide() {
    if(!callbackFn(isCancelled)) {
      this.input.focus();
      this.input.select();
      return;
    }

    this.input.display = '';
    this.input.parentElement && this.input.parentElement.removeChild(this.input);
    
    isCancelled = false;
  }

  fit() {
    document.body.appendChild(this._p);
    this._p.innerHTML = this.text;
    this.input.style.width = (this._p.offsetWidth + MARGIN_WIDTH) + 'px';
    this.input.style.left = (center - this.input.offsetWidth / 2) + 'px';
    document.body.removeChild(this._p);
  }

  checkKeys(e) {
    switch(e.key || e.keyCode) {
      case 'Enter':
      case '13':
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