import { state } from "./state.js";

const HANDLES = [[-1,-1],[0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1],[-1,0]];
const MIN_HANDLE_EXTENT = 32; // CSS pixels, independent of source size and character zoom.
const VIEW_MAX_AGE_MS = 250;
let svg, target, drag, scopedCharacter, textureDraw;

function active() {
    return state.freeTransform && state.currentEditTexture >= 0 && !state.poseSwitchMode &&
        (!state.poseEditing || (state.poseViewMode && state.tempTextureData?.PoseSettings?.[state.poseEditing]?.enabled)) &&
        typeof CharacterGetCurrent === "function" && CharacterGetCurrent() && DialogFocusItem &&
        (!DialogFocusItem.Property?.LockedBy || DialogCanUnlock(CharacterGetCurrent(), DialogFocusItem));
}
function selected(C, item, layer) {
    return active() && C === CharacterGetCurrent() && item === DialogFocusItem && layer === state.currentEditTexture;
}
function hasCurrentView() {
    return active() && state.transformView && Date.now()-state.transformView.time <= VIEW_MAX_AGE_MS;
}
export function clearTextureGeometry(C, item, layer) {
    if (selected(C, item, layer)) state.transformGeometry = null;
}
export function captureTextureGeometry(C, item, layer, geometry) {
    if (selected(C, item, layer)) state.transformGeometry = { ...geometry, item, layer, C };
}

/** Scope only the normal (non-blink) draw of the exact selected temporary canvas. */
export function drawCapturedTexture(C, item, layer, geometry, canvas, drawX, drawY, draw) {
    captureTextureGeometry(C, item, layer, geometry);
    const previous = textureDraw;
    textureDraw = selected(C, item, layer) ? { canvas, drawX, drawY, geometry:state.transformGeometry } : null;
    try { return draw(); } finally { textureDraw = previous; }
}

/** Match DrawImageEx's SourcePos, destination scaling/mirroring and current context matrix. */
export function imageMatrix(source, x, y, options = {}, m = { a:1,b:0,c:0,d:1,e:0,f:0 }) {
    const [u,v,w,h] = options.SourcePos || [0,0,source.width,source.height];
    const width = options.Width ?? w, height = options.Height ?? h, zoom = options.Zoom ?? 1;
    const sx = zoom * (options.Mirror ? -1 : 1) * width / w;
    const sy = zoom * (options.Invert ? -1 : 1) * height / h;
    const tx = x + (options.Mirror ? width : 0) - u * sx;
    const ty = y + (options.Invert ? height : 0) - v * sy;
    return { a:m.a*sx, b:m.b*sx, c:m.c*sy, d:m.d*sy,
        e:m.a*tx+m.c*ty+m.e, f:m.b*tx+m.d*ty+m.f };
}
export function mapPoint(m, x, y) { return { x:m.a*x+m.c*y+m.e, y:m.b*x+m.d*y+m.f }; }
export function unmapPoint(m, x, y) {
    const det = m.a*m.d-m.b*m.c;
    if (!Number.isFinite(det) || Math.abs(det) < 1e-10) return null;
    return { x:(m.d*(x-m.e)-m.c*(y-m.f))/det, y:(m.a*(y-m.f)-m.b*(x-m.e))/det };
}
export function geometryPoint(g, hx, hy) {
    const rad = g.rotation*Math.PI/180, dx = hx*g.width/2, dy = hy*g.height/2;
    return { x:g.centerX+dx*Math.cos(rad)-dy*Math.sin(rad), y:g.centerY+dx*Math.sin(rad)+dy*Math.cos(rad) };
}

/** Capture BC functions, never replace native Canvas methods or assume the preview's origin. */
export function setupTransformCapture(hooks) {
    hooks.hookFunction("GLDraw2DCanvas", 0, (args, next) => {
        if (textureDraw && args[1] === textureDraw.canvas) {
            // ECHO and similar renderers supply an extra atlas origin here. Blink is outside this scope.
            const dx = args[2] - textureDraw.drawX + (args[4] || 0);
            const dy = args[3] - textureDraw.drawY;
            const g = textureDraw.geometry;
            state.transformGeometry = { ...g, anchorX:g.anchorX+dx, anchorY:g.anchorY+dy,
                centerX:g.centerX+dx, centerY:g.centerY+dy };
        }
        return next(args);
    });
    hooks.hookFunction("DrawCharacter", 0, (args, next) => {
        const previous = scopedCharacter;
        scopedCharacter = active() && args[0] === CharacterGetCurrent() && args[1] < 1000 ? args[0] : null;
        try { return next(args); } finally { scopedCharacter = previous; }
    });
    hooks.hookFunction("DrawImageEx", 0, (args, next) => {
        const [source, canvas, x, y, options] = args;
        if (scopedCharacter && canvas === MainCanvas && (source === scopedCharacter.Canvas || source === scopedCharacter.CanvasBlink)) {
            state.transformView = { matrix:imageMatrix(source,x,y,options,canvas.getTransform()), time:Date.now() };
        }
        return next(args);
    });
    // Remove DOM even when BC stops calling the item editor (screen switch, loss of focus, etc.).
    hooks.hookFunction("DrawProcess", 0, (args, next) => {
        const result = next(args);
        if (!hasCurrentView()) hideTransformOverlay();
        return result;
    });
}

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
/** Work in character-canvas coordinates; center stays fixed for resize and rotation. */
export function transformValues(g, initial, start, point, handle) {
    const dx = point.x-start.x, dy = point.y-start.y;
    if (handle === 'move') return { OffsetX:clamp(Math.round(initial.OffsetX+dx),-10000,10000), OffsetY:clamp(Math.round(initial.OffsetY+dy),-10000,10000) };
    if (handle === 'rotate') {
        const a = Math.atan2(start.y-g.centerY,start.x-g.centerX), b = Math.atan2(point.y-g.centerY,point.x-g.centerX);
        const delta = Math.atan2(Math.sin(b-a),Math.cos(b-a));
        return { Rotation:Math.round(((initial.Rotation+delta*180/Math.PI+180)%360+360)%360-180) };
    }
    const [hx,hy] = HANDLES[Number(handle)], rad = g.rotation*Math.PI/180;
    const lx = dx*Math.cos(rad)+dy*Math.sin(rad), ly = -dx*Math.sin(rad)+dy*Math.cos(rad);
    let w = g.width+(hx ? 2*hx*lx : 0), h = g.height+(hy ? 2*hy*ly : 0);
    if (initial.ScaleLocked !== false) {
        const factor = hx && hy ? 1+2*(hx*lx*g.width+hy*ly*g.height)/(g.width*g.width+g.height*g.height)
            : hx ? w/g.width : h/g.height;
        const minFactor = Math.max((g.minimumWidth || MIN_HANDLE_EXTENT)/g.width, (g.minimumHeight || MIN_HANDLE_EXTENT)/g.height);
        const maxFactor = Math.min(8192/g.width,8192/g.height,20*g.sourceWidth/g.width,20*g.sourceHeight/g.height);
        const bounded = clamp(factor, Math.min(minFactor,maxFactor), maxFactor);
        w = g.width*bounded; h = g.height*bounded;
    }
    const minX = Math.max(1,Math.ceil((g.minimumWidth || MIN_HANDLE_EXTENT)/g.sourceWidth*100));
    const minY = Math.max(1,Math.ceil((g.minimumHeight || MIN_HANDLE_EXTENT)/g.sourceHeight*100));
    const sx = Math.round(clamp(w/g.sourceWidth*100,Math.min(minX,2000),Math.min(2000,819200/g.sourceWidth)));
    const sy = Math.round(clamp(h/g.sourceHeight*100,Math.min(minY,2000),Math.min(2000,819200/g.sourceHeight)));
    // render.js rounds dimensions and rotates about anchor+offset+half-size.
    return { ScaleX:sx, ScaleY:sy,
        OffsetX:clamp(g.centerX-g.anchorX-Math.round(g.sourceWidth*sx/100)/2,-10000,10000),
        OffsetY:clamp(g.centerY-g.anchorY-Math.round(g.sourceHeight*sy/100)/2,-10000,10000) };
}

function eventPoint(event, matrix) {
    const canvas = MainCanvas.canvas, rect = canvas.getBoundingClientRect();
    return unmapPoint(matrix,(event.clientX-rect.left)*canvas.width/rect.width,(event.clientY-rect.top)*canvas.height/rect.height);
}
function minimumGeometry(g, matrix) {
    const rect = MainCanvas.canvas.getBoundingClientRect(), rad = g.rotation*Math.PI/180;
    const cssLength = (x,y) => Math.hypot((matrix.a*x+matrix.c*y)*rect.width/MainCanvas.canvas.width,
        (matrix.b*x+matrix.d*y)*rect.height/MainCanvas.canvas.height);
    return { ...g, minimumWidth:Math.min(8192,20*g.sourceWidth,MIN_HANDLE_EXTENT/cssLength(Math.cos(rad),Math.sin(rad))),
        minimumHeight:Math.min(8192,20*g.sourceHeight,MIN_HANDLE_EXTENT/cssLength(-Math.sin(rad),Math.cos(rad))) };
}

function startDrag(event) {
    const handle = event.target.getAttribute('data-handle');
    if (handle === null || event.button !== 0 || !active() || !target || !state.transformGeometry || !state.transformView) return;
    const g = state.transformGeometry, matrix = state.transformView.matrix, start = eventPoint(event,matrix);
    if (!start) return;
    event.preventDefault(); event.stopPropagation();
    const sized = minimumGeometry(g,matrix);
    drag = { g:sized, matrix, start, handle, target, pointer:event.pointerId, pose:state.poseEditing,
        initial:{ ...g.params, ScaleLocked:target.ScaleLocked } };
    state.transformDragging = true;
    svg.setPointerCapture(event.pointerId);
}
function moveDrag(event) {
    if (!drag || drag.pointer !== event.pointerId) return;
    if (!active() || target !== drag.target || drag.g.item !== DialogFocusItem || drag.pose !== state.poseEditing) { finishDrag(); return; }
    const point = eventPoint(event,drag.matrix);
    if (!point) return;
    Object.assign(target,transformValues(drag.g,drag.initial,drag.start,point,drag.handle));
    state._fieldsDirty = true;
    event.preventDefault(); event.stopPropagation();
}
function finishDrag() {
    const pointer = drag?.pointer;
    drag = null;
    state.transformDragging = false;
    state._lastTextureRefresh = 0;
    if (pointer !== undefined && svg?.hasPointerCapture(pointer)) svg.releasePointerCapture(pointer);
}
export function hideTransformOverlay() {
    finishDrag();
    if (svg) svg.style.display = 'none';
}
function createOverlay() {
    svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.id = 'sca-free-transform';
    svg.style.cssText = 'position:fixed;z-index:999;pointer-events:none;touch-action:none;user-select:none;overflow:hidden';
    svg.innerHTML = '<defs><clipPath id="sca-transform-clip"><rect /></clipPath></defs><g clip-path="url(#sca-transform-clip)">' +
        '<polygon data-handle="move" fill="rgba(150,60,255,.03)" stroke="#b360ff" stroke-width="2" style="pointer-events:auto;cursor:move"/>' +
        '<line stroke="#b360ff" stroke-width="2"/>' +
        '<circle data-handle="rotate" r="9" fill="#b360ff" stroke="white" style="pointer-events:auto;cursor:grab"/>' +
        HANDLES.map((_,i)=>`<rect data-handle="${i}" width="12" height="12" fill="#b360ff" stroke="white" style="pointer-events:auto;cursor:crosshair"/>`).join('')+'</g>';
    svg.addEventListener('pointerdown',startDrag);
    svg.addEventListener('pointermove',moveDrag);
    svg.addEventListener('pointerup',event=>{ moveDrag(event); finishDrag(); event.stopPropagation(); });
    for (const name of ['pointercancel','lostpointercapture']) svg.addEventListener(name,finishDrag);
    for (const name of ['mousedown','mouseup','click','touchstart','touchend']) svg.addEventListener(name,event=>event.stopPropagation());
    window.addEventListener('blur',hideTransformOverlay);
    document.body.appendChild(svg);
}
function attributes(node, values) { for (const [key,value] of Object.entries(values)) node.setAttribute(key,String(value)); }
export function updateTransformOverlay(editTarget) {
    target = editTarget;
    const g = state.transformGeometry, view = state.transformView;
    if (!hasCurrentView() || !g || g.item !== DialogFocusItem || g.layer !== state.currentEditTexture) { hideTransformOverlay(); return; }
    const sized = minimumGeometry(g,view.matrix);
    if (g.width < sized.minimumWidth-1 || g.height < sized.minimumHeight-1) {
        // Recover old zero/tiny scales on entering this tool, retaining the rendered center.
        const recover = { ...sized, width:Math.max(g.width,1), height:Math.max(g.height,1) };
        Object.assign(target,transformValues(recover,{...g.params,ScaleLocked:target.ScaleLocked},{x:0,y:0},{x:0,y:0},'4'));
        state._fieldsDirty = true;
        hideTransformOverlay();
        return;
    }
    if (!svg) createOverlay();
    const canvas = MainCanvas.canvas, rect = canvas.getBoundingClientRect(), m = view.matrix;
    Object.assign(svg.style,{display:'block',left:rect.left+'px',top:rect.top+'px',width:rect.width+'px',height:rect.height+'px'});
    attributes(svg,{preserveAspectRatio:"none",viewBox:`0 0 ${canvas.width} ${canvas.height}`});
    attributes(svg.querySelector('clipPath rect'),{width:canvas.width/2,height:canvas.height});
    const points = HANDLES.map(([hx,hy])=>{ const p=geometryPoint(g,hx,hy); return mapPoint(m,p.x,p.y); });
    const center = mapPoint(m,g.centerX,g.centerY), top = points[1];
    const distance = Math.hypot(top.x-center.x,top.y-center.y) || 1;
    const rotate = {x:top.x+32*(top.x-center.x)/distance,y:top.y+32*(top.y-center.y)/distance};
    attributes(svg.querySelector('polygon'),{points:[0,2,4,6].map(i=>`${points[i].x},${points[i].y}`).join(' ')});
    attributes(svg.querySelector('line'),{x1:top.x,y1:top.y,x2:rotate.x,y2:rotate.y});
    attributes(svg.querySelector('circle'),{cx:rotate.x,cy:rotate.y});
    svg.querySelectorAll('rect[data-handle]').forEach((node,i)=>attributes(node,{x:points[i].x-6,y:points[i].y-6}));
}
