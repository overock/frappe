import Action from '../renderer/action';
import Flow from '../renderer/flow';
import actionDef from '../defs/action';

export default class RendererFactory {
    static create(model) {
        const type = (model.type || '').toLowerCase();
        switch(type) {
        case 'flow':
            return new Flow(model);
        default:
            return new Action(model, actionDef[type]);
        }
    }
}