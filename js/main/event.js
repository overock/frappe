import MdPool from '../model/pool';

let instance,
    metric, m,
    dx, dy, ox, oy,
    currentModel = null,
    isDragging = false;

const
    viewBox = { x: 0, y: 0, w: 0, h: 0, z: 1 },
    pool = new MdPool(),
    getModel = el => (currentModel = pool.item(el.closest('g').getAttribute('id'))),

    // 이벤트 발생기
    emit = (type, param) => window.dispatchEvent(new CustomEvent(type, { detail: param })),

    // handle 아이콘 보이기/숨기기
    showHandle = () => currentModel && currentModel.renderer.handle.classList.add('frappe-handle-hover'),
    hideHandle = () => currentModel && currentModel.renderer.handle.classList.remove('frappe-handle-hover'),
    showGadget = e => {
        if(isDragging) return;
        getModel(e.target);
        showHandle();
    },
    hideGadget = () => {
        if(isDragging) return;
        hideHandle();
        currentModel = null;
    },
    
    /**
     * 액션 드래그&드롭 이동
     */ 
    actionDragStart = e => {
        if(isDragging) return;
        isDragging = true;

        e.preventDefault();
        
        dx = e.pageX - currentModel.left * viewBox.z, dy = e.pageY - currentModel.top * viewBox.z;
        window.addEventListener('mousemove', actionDragging);
        window.addEventListener('mouseup', actionDragEnd);
    },
    actionDragging = e => {
        currentModel.moveTo((e.pageX - dx)/viewBox.z, (e.pageY - dy)/viewBox.z);
        pool.render();
    },
    actionDragEnd = e => {
        window.removeEventListener('mousemove', actionDragging);
        window.removeEventListener('mouseup', actionDragEnd);
        actionDragging(e);
        isDragging = false;
    },

    /**
     * 액션, 디시전 속성 편집
     */
    propEditor = () => emit('frappe.edit', currentModel),

    /**
     * 캔버스 이동/줌
     */
    canvasDragStart = e => {
        if(isDragging) return;
        isDragging = true;

        dx = e.pageX/viewBox.z, dy = e.pageY/viewBox.z, ox = viewBox.x, oy = viewBox.y;
        window.addEventListener('mousemove', canvasDragging);
        window.addEventListener('mouseup', canvasDragEnd);
    },
    canvasDragging = e => {
        viewBox.x = dx - e.pageX/viewBox.z + ox,
        viewBox.y = dy - e.pageY/viewBox.z + oy;
        emit('frappe.canvasdrag', { viewBox: viewBox });
    },
    canvasDragEnd = e => {
        window.removeEventListener('mousemove', canvasDragging);
        window.removeEventListener('mouseup', canvasDragEnd);
        canvasDragging(e);
        isDragging = false;
    },
    canvasZoom = e => {
        e.preventDefault();
        e.stopPropagation();
        if(isDragging) return;
        
        emit('frappe.canvaszoom', { viewBox: viewBox, originalEvent: e });
    },

    /**
     * 새 액션 링크
     */
    evtProps = {
        from: null, to: null, 
        ghostAction: null, ghostFlow: null, ghostFlow2: null,
        top: 0, left: 0
    },
    branchStart = e => {
        e.preventDefault();
        isDragging = true;
        hideHandle();

        dx = e.pageX, dy = e.pageY;

        const
            hold = e => {
                const dist = Math.pow(e.pageX - dx, 2) + Math.pow(e.pageY - dy, 2);
                if(dist>64) {
                    window.removeEventListener('mousemove', hold);
                    window.removeEventListener('mouseup', release);

                    m = metric();

                    [ evtProps.from, evtProps.top, evtProps.left ] = [ currentModel, (e.pageY-m.top)/viewBox.z + viewBox.y - 32, (e.pageX-m.left)/viewBox.z + viewBox.x - 32 ];

                    emit('frappe.branchstart', { props: evtProps });

                    window.addEventListener('mousemove', branching);
                    window.addEventListener('mouseup', branchEnd);
                }
            }, release = () => {
                window.removeEventListener('mousemove', hold);
                window.removeEventListener('mouseup', release);

                isDragging = false;
                showHandle();
            };

        window.addEventListener('mousemove', hold);
        window.addEventListener('mouseup', release);
    },
    branching = e => {
        [ evtProps.top, evtProps.left ] = [ (e.pageY-m.top)/viewBox.z + viewBox.y - 32, (e.pageX-m.left)/viewBox.z + viewBox.x - 32 ];
        const { ghostAction: action, top: top, left: left } = evtProps;

        action.moveTo(left, top);
        
        emit('frappe.checkarea', { viewBox: viewBox, props: evtProps, originalEvent: e });
    },
    branchEnd = e => {
        window.removeEventListener('mousemove', branching);
        window.removeEventListener('mouseup', branchEnd);

        branching(e);
        emit('frappe.branchend', { props: evtProps, listener: branchSelect });

        isDragging = false;
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
        isDragging = true;
        hideHandle();

        dx = e.pageX, dy = e.pageY;

        const
            hold = e => {
                const dist = Math.pow(e.pageX - dx, 2) + Math.pow(e.pageY - dy, 2);
                if(dist>64) {
                    window.removeEventListener('mousemove', hold);
                    window.removeEventListener('mouseup', release);

                    m = metric();

                    [ evtProps.from, evtProps.top, evtProps.left] = [ currentModel, (e.pageY-m.top)/viewBox.z + viewBox.y - 32, (e.page-m.left)/viewBox.z + viewBox.x - 32 ];

                    emit('frappe.snapstart', { props: evtProps });

                    window.addEventListener('mousemove', snapping);
                    window.addEventListener('mouseup', snapEnd);
                }
            }, release = () => {
                window.removeEventListener('mousemove', hold);
                window.removeEventListener('mouseup', release);
            };

        window.addEventListener('mousemove', hold);
        window.addEventListener('mouseup', release);
    },
    snapping = e => {
        [ evtProps.top, evtProps.left ] = [ (e.pageY-m.top)/viewBox.z + viewBox.y - 32, (e.pageX-m.left)/viewBox.z + viewBox.x - 32 ];
        const { ghostAction: action, ghostFlow: flow1, ghostFlow2: flow2, top: top, left: left } = evtProps;

        action.moveTo(left, top);
        action.render();
        flow1.render();
        flow2.render();
    },
    snapEnd = e => {
        window.removeEventListener('mousemove', snapping);
        window.removeEventListener('mouseup', snapEnd);

        snapping(e);
        emit('frappe.snapend', { props: evtProps, listener: snapSelect });

        isDragging = false;
    },
    snapSelect = e => {
        emit('frappe.snapconfirm', {
            props: evtProps,
            type: e.target.getAttribute('data-actiontype'),
            listener: snapSelect,
            confirmed: e.target.classList.contains('frappe-branch-confirm')
        });
    };

export default class EventHandler {
    constructor() {
        if(instance) return instance;
        instance = this;
    }

    bind(frappe) {
        [ viewBox.x, viewBox.y, viewBox.w, viewBox.h ] = [ 0, 0, frappe.metric.width, frappe.metric.height ];

        frappe.canvas.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`);
        
        frappe.canvas.addEventListener('contextmenu', e => e.preventDefault());
        frappe.canvas.addEventListener('mousedown', canvasDragStart);
        frappe.canvas.addEventListener('mousewheel', canvasZoom);

        metric = () => frappe.metric;
    }

    listen(model) { this._batch(model, 'addEventListener'); }
    deafen(model) { this._batch(model, 'removeEventListener'); }

    _batch(model, method) {
        // action/flow 공통
        model.renderer.element[method]('dblclick', propEditor);

        model.element[method]('mouseover', showGadget);
        model.element[method]('mouseout', hideGadget);
        // action 전용
        if(model.isFlow) {
            model.renderer.handle[method]('mousedown', snapStart);
        } else {
            model.renderer.handle[method]('mousedown', actionDragStart);
            model.renderer.element[method]('mousedown', branchStart);
        }
    }

    get viewBox() { return viewBox; }
    set viewBox(values) { [ viewBox.x, viewBox.y, viewBox.w, viewBox.h ] = values.split(' ').map(v => v|0); }
}