import Action from '../model/action';
import Decision from '../model/decision';
import actionDef from '../defs/action';

export default class {
    static create(type, top, left, bottom, right) {
        type = (type|| '').toLowerCase();
        switch(type) {
        case 'decision':
            return new Decision(top, left, bottom, right);
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