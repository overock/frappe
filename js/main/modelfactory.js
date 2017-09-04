import Action from '../model/action';
import Flow from '../model/flow';
import actionDef from '../defs/action';

export default class {
    static create(type, top, left, bottom, right) {
        type = (type|| '').toLowerCase();
        switch(type) {
        case 'flow':
            return new Flow(top, left, bottom, right);
        default:
            return new Action(type, top, left, actionDef[type]);
        }
    }

    static createGhost(type, top, left, bottom, right) {
        let model = this.create(type, top, left, bottom, right);
        model.isGhost = true;
        return model;
    }
}