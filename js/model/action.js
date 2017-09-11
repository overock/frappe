import Model from './base';
import actionDef from '../defs/action.js';

export default class ActionModel extends Model {
    constructor(type, top, left) {
        super(type, top, left);

        this.props.merge(this.def.props); //Object.assign({}, this.def.props);
        
        this.def.width && (this.width = this.def.width);
        this.def.height && (this.height = this.def.height);

        this.rules.min = this.rules.min || 0;
        this.rules.max = this.rules.max || -1;
        this.rules.maxFrom = this.rules.maxFrom || 1;
        this.rules.maxNaxt = this.rules.maxNext || 1;
    }

    get def() { return actionDef[this.type]; }
    get rules() { return this.def.rules; }

    get bottom() { return this.top + this.height; }
    get right() { return this.left + this.width; }

    get prevAction() { return !!this.prev[0] && this.prev[0].prev[0]; }
    get nextAction() { return !!this.next[0] && this.next[0].next[0]; }
    get prevActions() { return this.prev.map(f => f.prev[0]); }
    get nextActions() { return this.next.map(f => f.next[0]); }
    
    isConnectedTo(target) {
        const
            _b = [],
            _f = a => a.prevActions./*filter(b => _b.indexOf[b]==-1).*/some(c => {
                if(c == target) return true;
                _b.push(c);
                return _f(c);
            });
        
        return _f(this);
    }
    
    adjustEdges() {
        this.prev.forEach(f => f.fitToNodes());
        this.next.forEach(f => f.fitToNodes());
    }
}