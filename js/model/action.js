import Model from './base';
import actionDef from '../defs/action.js';

export default class ActionModel extends Model {
    constructor(type, top, left) {
        super(type, top, left);

        this.props = Object.assign({}, this.def.props);
        
        this.def.width && (this.width = this.def.width);
        this.def.height && (this.height = this.def.height);
    }

    get def() { return actionDef[this.type]; }
    get rules() { return this.def.rules; }

    get bottom() { return this.top + this.height; }
    get right() { return this.left + this.width; }

    get prevAction() { return !!this.prev[0] && this.prev[0].prev[0]; }
    get nextAction() { return !!this.next[0] && this.next[0].next[0]; }
    get prevActions() { return this.prev.map(f => f.prev[0]); }
    get nextActions() { return this.next.map(f => f.next[0]); }

    isAdjacentTo(target) {
        return this.prev.some(m => m.prev[0] == target) || this.next.some(m => m.next[0] == target);
    }

    // TODO: 대상 모델이 현 모델의 prev 또는 next로 포함될 때, 그래프가 circuit을 만드는지 확인
    isMakingCircuit(/*target*/) {
        return false;
    }
    
    adjustEdges() {
        this.prev.forEach(f => f.fitToNodes());
        this.next.forEach(f => f.fitToNodes());
    }
}