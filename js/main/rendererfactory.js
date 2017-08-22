import Action from '../renderer/action';
import Decision from '../renderer/decision';
import actionDef from '../defs/action';

export default class {
    static create(model) {
        const type = (model.type || '').toLowerCase();
        switch(type) {
        case 'decision':
            return new Decision(model);
        default:
            return new Action(model, actionDef[type]);
        }
    }
};