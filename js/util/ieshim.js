// classList
(() => {
  class ClassList {
    constructor(e) {
      this.element = e;
    }

    get list() {
      const s = this.element.getAttribute('class');
      return s? s.split(/\s+/) : [];
    }

    set list(a) {
      this.element.setAttribute('class', a.join(' '));
    }

    add(...args) {
      args.forEach(v => this.contains(v) || (this.list = this.list.concat(v)));
    }

    remove(...args) {
      args.forEach(v => this.contains(v) && (this.list = this.list.filter(w => w!=v)));
    }

    toggle(s) {
      return this.contains(s)? (this.remove(s), false) : (this.add(s), true);
    }

    contains(s) { return this.list.indexOf(s) != -1; }
  }

  'classList' in Element.prototype || Object.defineProperty(Element.prototype, 'classList', { get() { return new ClassList(this); } });
})();

// Array prototype
(() => {
  'findIndex' in Array.prototype || Object.defineProperty(Array.prototype, 'findIndex', {
    value(predicate, thisArg) {
      if(this == null) throw new TypeError('Array.prototype.findIndex called on null or undefined');
      if(typeof predicate != 'function') throw new TypeError('Predicate must be a function');
      const list = Object(this), length = list.length >>> 0;

      for(let i = 0; i<length; i++)
        if(predicate.call(thisArg, list[i], i, list))
          return i;
      
      return -1;
    },
    enumerable: false,
    configurable: false,
    writable: false
  });

  'find' in Array.prototype || Object.defineProperty(Array.prototype, 'find', {
    value(predicate, thisArg) {
      if(this == null) throw new TypeError('Array.prototype.find called on null or undefined');
      if(typeof predicate != 'function') throw new TypeError('Predicate must be a function');
      const list = Object(this), length = list.length >>> 0;

      for(let i = 0; i<length; i++)
        if(predicate.call(thisArg, list[i], i, list))
          return list[i];

      return undefined;
    },
    enumerable: false,
    configurable: false,
    writable: false
  });

  'fill' in Array.prototype || Object.defineProperty(Array.prototype, 'fill', {
    value(v, s, e) {
      if(this == null) throw new TypeError('Array.prototype.fill called on null or undefined');
      const list = Object(this), length = list.length >>> 0;
      s = s >> 0;
      e = e == undefined? length : e >> 0;

      let i = s<0? Math.max(length + s, 0) : Math.min(s, length),
          d = e<0? Math.max(length + e, 0) : Math.min(e, length);
      
      while(i<d) list[i++] = v;

      return list;
    }
  });
})();

// firstElementChild
(C => {
  C.prototype.firstElementChild || Object.defineProperty(C.prototype, 'firstElementChild', {
    get() {
      let node, nodes = this.childNodes, i = 0;
      while((node = nodes[i++])) if(node.nodeType == 1) return node;
      return null;
    }
  });
})(window.Node || window.Element);

// closest
(() => {
  if(!Element.prototype.matches)
    Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;

  Element.prototype.closest || Object.defineProperty(Element.prototype, 'closest', {
    value(s) {
      let el = this;
      if(!document.documentElement.contains(el)) return null;

      do {
        if(el.matches(s)) return el;
        el = el.parentElement || el.parentNode;
      } while(el !== null && el.nodeType === 1);
      return null;
    }
  });
})();

// CustomEvent
(() => {
  if(typeof window.CustomEvent != 'function') {
    window.CustomEvent = (t, p = { bubbles: false, cancelable: false, detail: undefined }) => {
      const evt = document.createEvent('CustomEvent');
      evt.initCustomEvent(t, p.bubbles, p.cancelable, p.detail);
      return evt;
    };

    window.CustomEvent.prototype = window.Event.prototype;
  }

})();