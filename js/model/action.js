import Base from './base';

export default class extends Base {
    constructor(type, top, left, def) {
        super(type, top, left);
        this._props_ = def.props;
        this._rules_ = def.rules;
        
        def && def.width && (this.width = def.width);
        def && def.height && (this.height = def.height);
    }

    get bottom() { return this.top + this.height; }
    get right() { return this.left + this.width; }

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