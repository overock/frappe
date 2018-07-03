import MdPool from '../model/pool';
import LineEditor from '../util/lineeditor';
let instance,
    metric, m,
    dx, dy, ox, oy,
    currentModel = null,
    editMode = false;

const viewBox = { x: 0, y: 0, w: 0, h: 0, z: 1 },
      pool = new MdPool(),

      // codelets
      getModel = el => {
        el.correspondingUseElement && (el = el.correspondingUseElement);
        currentModel = pool.item(el.closest('g').getAttribute('id'));
      },
      emit = (type, param) => window.dispatchEvent(new CustomEvent(type, { detail: param })),

      // handle 아이콘 보이기/숨기기
      showHandle = () => {
        if(currentModel) {
          currentModel.renderer.handle.classList.add('frappe-handle-hover');
          currentModel.renderer.removeBtn && currentModel.renderer.removeBtn.classList.add('frappe-handle-hover');
          currentModel.renderer.asc && currentModel.renderer.asc.classList.add('frappe-handle-hover');
          currentModel.renderer.desc && currentModel.renderer.desc.classList.add('frappe-handle-hover');
        }
      },
      hideHandle = () => {
        if(currentModel) {
          currentModel.renderer.handle.classList.remove('frappe-handle-hover');
          currentModel.renderer.removeBtn && currentModel.renderer.removeBtn.classList.remove('frappe-handle-hover');
          currentModel.renderer.asc && currentModel.renderer.asc.classList.remove('frappe-handle-hover');
          currentModel.renderer.desc && currentModel.renderer.desc.classList.remove('frappe-handle-hover');
        }
      },
      showGadget = e => {
        if(editMode) return;
        getModel(e.target);
        showHandle();
      },
      hideGadget = () => {
        if(editMode) return;
        hideHandle();
        currentModel = null;
      },

      /**
       * 삭제
       */
      remove = () => emit('frappe.remove', { model: currentModel }),

      /**
       * 액션 드래그&드롭 이동
       */
      actionDragStart = e => {
        if(editMode) return;
        editMode = true;

        e.preventDefault();

        dx = e.pageX - currentModel.left * viewBox.z, dy = e.pageY - currentModel.top * viewBox.z;
        window.addEventListener('mousemove', actionDragging);
        window.addEventListener('mouseup', actionDragEnd);
      },
      actionDragging = e => {
        currentModel.moveTo((e.pageX - dx) / viewBox.z, (e.pageY - dy) / viewBox.z);
        pool.render();
      },
      actionDragEnd = e => {
        window.removeEventListener('mousemove', actionDragging);
        window.removeEventListener('mouseup', actionDragEnd);
        actionDragging(e);

        emit('frappe.change');
        editMode = false;
      },

      /**
       * 액션, 디시전 속성 편집
       */
      propEditor = () => {
        emit('frappe.change');
        emit('frappe.edit', currentModel);
      },

      textInput = new LineEditor(),
      editText = e => {
        if(editMode || !currentModel || !currentModel.isRenamable) return;
        editMode = true;

        e.preventDefault();
        e.stopPropagation();

        hideHandle();

        const rect = e.target.getBoundingClientRect(),
              cX = rect.x + rect.width / 2,
              cY = rect.y + rect.height / 2,
              text = currentModel.isFlow? currentModel.cond : currentModel.name;

        textInput.show(cX, cY, {
          text: text,
          deg: currentModel.angle / Math.PI * 180,
          scale: viewBox.z
        }, editTextDone);

        currentModel.isFlow? textInput.elAssist.enable() : textInput.elAssist.disable();

        currentModel.editing = true;
        currentModel.render();
      },
      editTextDone = bCancel => {
        const name = currentModel.type == 'start' ? 'start' : textInput.text.trim(),
              regex = currentModel.isFlow ? /.*/ : /^[a-zA-Z_][\-_a-zA-Z0-9]{0,38}$/g,
              matches = regex.test(name),
              exists = !currentModel.isFlow && pool.filter(m => m!=currentModel).some(m => m.name == name);

        if(!bCancel && (!matches || exists)) return false;
        
        bCancel || (currentModel.name = name);
        currentModel.editing = false;
        currentModel.render();
        currentModel.prev[0] && currentModel.prev[0].render();
        currentModel = null;
        editMode = false;

        emit('frappe.change');

        return true;
      },

      /**
       * 캔버스 이동/줌
       */
      canvasDragStart = e => {
        if(editMode) return;
        editMode = true;

        dx = e.pageX / viewBox.z, dy = e.pageY / viewBox.z, ox = viewBox.x, oy = viewBox.y;
        window.addEventListener('mousemove', canvasDragging);
        window.addEventListener('mouseup', canvasDragEnd);
      },
      canvasDragging = e => {
        viewBox.x = dx - e.pageX / viewBox.z + ox,
        viewBox.y = dy - e.pageY / viewBox.z + oy;
        emit('frappe.canvasdrag', { viewBox: viewBox });
      },
      canvasDragEnd = e => {
        window.removeEventListener('mousemove', canvasDragging);
        window.removeEventListener('mouseup', canvasDragEnd);
        canvasDragging(e);
        editMode = false;
      },
      canvasZoom = e => {
        e.preventDefault();
        e.stopPropagation();
        if(editMode) return;

        emit('frappe.canvaszoom', { viewBox: viewBox, originalEvent: e });
      },

      /**
       * 새 액션 링크
       */
      evtProps = {
        from: null,
        to: null,
        ghostAction: null,
        ghostFlow: null,
        ghostFlow2: null,
        top: 0,
        left: 0
      },
      branchStart = e => {
        e.preventDefault();

        if(currentModel.nextActions.length>=currentModel.rules.maxTo) {
          e.stopPropagation();
          return;
        }
        
        editMode = true;
        hideHandle();

        dx = e.pageX, dy = e.pageY;

        const hold = e => {
                const dist = Math.pow(e.pageX - dx, 2) + Math.pow(e.pageY - dy, 2);
                if(dist > 64) {
                  window.removeEventListener('mousemove', hold);
                  window.removeEventListener('mouseup', release);

                  m = metric();

                  [ evtProps.from, evtProps.top, evtProps.left ] = [ currentModel, (e.pageY - m.top) / viewBox.z + viewBox.y - 32, (e.pageX - m.left) / viewBox.z + viewBox.x - 32 ];

                  emit('frappe.branchstart', { props: evtProps });

                  window.addEventListener('mousemove', branching);
                  window.addEventListener('mouseup', branchEnd);
                }
              },
              release = () => {
                window.removeEventListener('mousemove', hold);
                window.removeEventListener('mouseup', release);

                editMode = false;
                showHandle();
              };

        window.addEventListener('mousemove', hold);
        window.addEventListener('mouseup', release);
      },
      branching = e => {
        [ evtProps.top, evtProps.left ] = [ (e.pageY - m.top) / viewBox.z + viewBox.y - 32, (e.pageX - m.left) / viewBox.z + viewBox.x - 32 ];
        const {
          ghostAction: action,
          top: top,
          left: left
        } = evtProps;

        action.moveTo(left, top);

        emit('frappe.checkarea', {
          props: evtProps
        });
      },
      branchEnd = e => {
        window.removeEventListener('mousemove', branching);
        window.removeEventListener('mouseup', branchEnd);

        branching(e);
        emit('frappe.branchend', {
          props: evtProps,
          listener: branchSelect
        });

        editMode = false;
      },
      branchSelect = e => {
        emit('frappe.branchconfirm', {
          props: evtProps,
          type: e.target.getAttribute('data-actiontype'),
          listener: branchSelect,
          confirmed: e.target.classList.contains('frappe-branch-confirm')
        });
      },

      /**
       * edge 사이에 액션 삽입
       */
      snapStart = e => {
        e.preventDefault();
        editMode = true;
        hideHandle();

        dx = e.pageX, dy = e.pageY;

        const hold = e => {
                const dist = Math.pow(e.pageX - dx, 2) + Math.pow(e.pageY - dy, 2);
                if(dist > 64) {
                  window.removeEventListener('mousemove', hold);
                  window.removeEventListener('mouseup', release);

                  m = metric();

                  [ evtProps.from, evtProps.top, evtProps.left ] = [ currentModel, (e.pageY - m.top) / viewBox.z + viewBox.y - 32, (e.page - m.left) / viewBox.z + viewBox.x - 32 ];

                  emit('frappe.snapstart', {
                    props: evtProps
                  });

                  window.addEventListener('mousemove', snapping);
                  window.addEventListener('mouseup', snapEnd);
                }
              },
              release = () => {
                window.removeEventListener('mousemove', hold);
                window.removeEventListener('mouseup', release);

                editMode = false;
                showHandle();
              };

        window.addEventListener('mousemove', hold);
        window.addEventListener('mouseup', release);
      },
      snapping = e => {
        [ evtProps.top, evtProps.left ] = [ (e.pageY - m.top) / viewBox.z + viewBox.y - 32, (e.pageX - m.left) / viewBox.z + viewBox.x - 32 ];
        const {
          ghostAction: action,
          ghostFlow: flow1,
          ghostFlow2: flow2,
          top: top,
          left: left
        } = evtProps;

        action.moveTo(left, top);
        action.render();
        flow1.render();
        flow2.render();
      },
      snapEnd = e => {
        window.removeEventListener('mousemove', snapping);
        window.removeEventListener('mouseup', snapEnd);

        snapping(e);
        emit('frappe.snapend', {
          props: evtProps,
          listener: snapSelect,
          confirmed: e.target.classList.contains('frappe-branch-confirm')
        });

        editMode = false;
      },
      snapSelect = e => {
        emit('frappe.snapconfirm', {
          props: evtProps,
          type: e.target.getAttribute('data-actiontype'),
          listener: snapSelect,
          confirmed: e.target.classList.contains('frappe-branch-confirm')
        });
      },
      ascOrder = () => {
        currentModel.order--;
        emit('frappe.change');
        emit('frappe.render');
      },
      descOrder = () => {
        currentModel.order++;
        emit('frappe.change');
        emit('frappe.render');
      };

export default class EventHandler {
  constructor() {
    if(instance) return instance;
    instance = this;
  }

  hotKeys(e) {
    if(editMode) return;
    //        console.log(e.key, e.keyCode);
    switch(e.key || e.keyCode) {
      case 'Backspace':
      case 8:
      case 'Delete':
      case 46:
        currentModel && emit('frappe.remove', { model: currentModel });
    }
  }

  bind(frappe) {
    [ viewBox.x, viewBox.y, viewBox.w, viewBox.h ] = [ 0, 0, frappe.metric.width, frappe.metric.height ];

    frappe.canvas.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`);

    frappe.canvas.addEventListener('contextmenu', e => e.preventDefault());
    frappe.canvas.addEventListener('mousedown', canvasDragStart);
    frappe.canvas.addEventListener('mousewheel', canvasZoom);

    metric = () => frappe.metric;
  }

  listen(model) {
    this._batch(model, 'addEventListener');
  }
  deafen(model) {
    this._batch(model, 'removeEventListener');
  }

  _batch(model, _) {
    // action/flow 공통
    model.element[_]('mouseover', showGadget);
    model.element[_]('mouseout', hideGadget);
    model.renderer.label[_]('click', editText);
    // action 전용
    if(model.isFlow) {
      model.renderer.handle[_]('mousedown', snapStart);
      model.renderer.asc[_]('click', ascOrder);
      model.renderer.desc[_]('click', descOrder);
    } else {
      model.renderer.element[_]('dblclick', propEditor);
      model.renderer.removeBtn[_]('click', remove);
      model.renderer.handle[_]('mousedown', actionDragStart);
      model.renderer.element[_]('mousedown', branchStart);
    }
  }

  get viewBox() { return viewBox; }
  set viewBox(values) { [ viewBox.x, viewBox.y, viewBox.w, viewBox.h ] = values.split(' ').map(v => v | 0); }

  setVars(list) { textInput.elAssist.setVars(...list); }
}