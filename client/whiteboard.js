// client/whiteboard.js
// Collaborative Whiteboard (Scrble Ink style) with continuous connected pages, page deletion,
// dynamic T/shape toolbar icon, vector shapes, text, undo/redo, and Socket.IO relay.

class WhiteboardManager {
  constructor() {
    this.socket = null;
    this.modal = null;
    this.container = null;
    this.pagesStack = null;

    this.currentRoomId = 'general';
    this.currentRoomName = 'Bảng vẽ văn phòng';

    // Multi-page document model (rendered seamlessly connected vertically)
    this.pages = [
      { id: 'page_1', bgStyle: 'grid', items: [] },
      { id: 'page_2', bgStyle: 'grid', items: [] }
    ];
    this.activePageIndex = 0;
    this.gesturePageIndex = 0;
    this.sheetWidth = 960;
    this.sheetHeight = 580;

    this.undoStacks = new Map();
    this.redoStacks = new Map();
    this.sheetElements = []; // [{ sheet, bgCanvas, drawCanvas, bgCtx, ctx }]

    // Active tool & ink configuration
    this.activeTool = 'pen'; // 'pen' | 'eraser' | 'select' | 'text' | 'laser' | shape keys
    this.lastShapeTool = 'text';
    this.currentColor = '#111827';
    this.currentSize = 2;
    this.currentAlpha = 1;

    // Interactive gesture state
    this.isPointerDown = false;
    this.dragStart = { x: 0, y: 0 };
    this.dragCurr = { x: 0, y: 0 };
    this.activeStrokePoints = [];
    this.selectedIds = new Set();
    this.marqueeRect = null;
    this.isMovingSelection = false;
    this.selectionMoveLast = null;
    this.movedSelectionFlag = false;
    this.pendingTextPos = null; // { pageIndex, x, y }
    this.laserTrail = [];
    this.eraserCursor = null; // { pageIndex, x, y }
    this.remoteCursors = new Map(); // senderId -> { senderId, userName, color, pageIndex, x, y, updatedAt }
    this.remoteLiveItems = new Map(); // senderId -> { pageIndex, item }
    this.imageCache = new Map(); // src -> HTMLImageElement
    this.lastPointerPos = null; // { pageIndex, x, y }
    this.cursorsLayer = null;
    this.localUserName = 'Bạn';
    this.lastCursorEmitTime = 0;
    this.lastLiveStrokeEmitTime = 0;
    this.cursorCleanupTimer = null;
    this.bgStylesOrder = ['grid', 'lined', 'dots', 'blank'];
    this.shapeSpecs = [];
    this.suppressScrollSync = false;
    this.isInitialized = false;
  }

  init(socket) {
    this.socket = socket;
    this.modal = document.getElementById('whiteboardModal');
    this.container = document.getElementById('whiteboardCanvasContainer');
    this.pagesStack = document.getElementById('wbPagesStack');
    this.cursorsLayer = document.getElementById('wbRemoteCursorsLayer');
    if (!this.modal || !this.container || !this.pagesStack) return;

    this.buildShapesPalette();
    this.setupToolbarListeners();
    this.setupStackListeners();
    this.setupSocketListeners();
    this.rebuildSheetElements();
    this.renderAll();
    this.isInitialized = true;
  }

  getActivePage() {
    if (!this.pages[this.activePageIndex]) {
      this.activePageIndex = Math.max(0, Math.min(this.activePageIndex, this.pages.length - 1));
    }
    return this.pages[this.activePageIndex];
  }

  getStack(map, pageIdx) {
    if (!map.has(pageIdx)) map.set(pageIdx, []);
    return map.get(pageIdx);
  }

  pushUndoSnapshot(pageIdx = this.activePageIndex) {
    const page = this.pages[pageIdx];
    if (!page) return;
    const undo = this.getStack(this.undoStacks, pageIdx);
    undo.push(JSON.stringify(page));
    if (undo.length > 40) undo.shift();
    this.redoStacks.set(pageIdx, []);
  }

  open(roomId = 'general', roomName = 'Bảng vẽ văn phòng') {
    if (!this.modal) return;
    this.currentRoomId = roomId;
    this.currentRoomName = roomName;
    this.remoteCursors.clear();
    this.remoteLiveItems.clear();
    this.renderRemoteCursors();
    this.modal.classList.remove('hidden');

    if (typeof window.syncWhiteboardParticipantsUI === 'function') {
      window.syncWhiteboardParticipantsUI();
    }
    if (typeof window.syncLobbyMusicState === 'function') {
      window.syncLobbyMusicState();
    }

    const dockWbBtn = document.getElementById('dockWhiteboardBtn');
    if (dockWbBtn) dockWbBtn.classList.add('active');

    if (this.socket && this.socket.connected) {
      this.socket.emit('WHITEBOARD_GET_HISTORY', { roomId: this.currentRoomId });
    }

    if (!this.cursorCleanupTimer) {
      this.cursorCleanupTimer = setInterval(() => this.pruneStaleRemoteCursors(), 1500);
    }

    setTimeout(() => {
      this.resizeCanvases();
      this.renderRemoteCursors();
    }, 40);
  }

  close() {
    this.commitInlineText();
    this.closeShapesPopover();
    if (this.socket && this.socket.connected && this.currentRoomId) {
      this.socket.emit('WHITEBOARD_CURSOR', { roomId: this.currentRoomId, visible: false });
      this.socket.emit('WHITEBOARD_LIVE_STROKE', { roomId: this.currentRoomId, active: false });
    }
    this.remoteCursors.clear();
    this.remoteLiveItems.clear();
    this.renderRemoteCursors();
    if (this.cursorCleanupTimer) {
      clearInterval(this.cursorCleanupTimer);
      this.cursorCleanupTimer = null;
    }
    if (this.modal) this.modal.classList.add('hidden');
    const dockWbBtn = document.getElementById('dockWhiteboardBtn');
    if (dockWbBtn) dockWbBtn.classList.remove('active');
    if (typeof window.syncLobbyMusicState === 'function') {
      window.syncLobbyMusicState();
    }
  }

  resizeCanvases() {
    if (!this.container) return;
    const rect = this.container.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    this.sheetWidth = Math.round(this.container.clientWidth || rect.width);
    // Size each sheet slightly shorter than viewport so the continuous seam to the next page is clearly visible
    this.sheetHeight = Math.max(460, Math.round((this.container.clientHeight || rect.height) * 0.86));
    this.rebuildSheetElements();
    this.renderAll();
  }

  rebuildSheetElements() {
    if (!this.pagesStack) return;
    this.pagesStack.innerHTML = '';
    this.sheetElements = [];

    this.pages.forEach((page, idx) => {
      const sheet = document.createElement('div');
      sheet.className = 'wb-page-sheet';
      sheet.dataset.pageIndex = String(idx);
      sheet.style.height = `${this.sheetHeight}px`;

      const seamTag = document.createElement('span');
      seamTag.className = 'wb-page-seam-tag';
      seamTag.textContent = `Trang ${idx + 1}`;

      const bgCanvas = document.createElement('canvas');
      bgCanvas.className = 'wb-bg-canvas';
      bgCanvas.width = this.sheetWidth;
      bgCanvas.height = this.sheetHeight;

      const drawCanvas = document.createElement('canvas');
      drawCanvas.className = 'wb-draw-canvas';
      drawCanvas.width = this.sheetWidth;
      drawCanvas.height = this.sheetHeight;

      sheet.appendChild(bgCanvas);
      sheet.appendChild(drawCanvas);
      sheet.appendChild(seamTag);
      this.pagesStack.appendChild(sheet);

      this.sheetElements.push({
        sheet,
        bgCanvas,
        drawCanvas,
        bgCtx: bgCanvas.getContext('2d'),
        ctx: drawCanvas.getContext('2d')
      });
    });
  }

  ensureSheetCountMatches() {
    if (this.sheetElements.length !== this.pages.length) {
      this.rebuildSheetElements();
    }
  }

  updateHeaderTitle() {
    const titleElem = document.getElementById('whiteboardRoomTitle');
    if (titleElem) {
      titleElem.textContent = `Untitled (${this.activePageIndex + 1}/${this.pages.length})`;
      titleElem.title = this.currentRoomName || 'Whiteboard';
    }
  }

  renderAll() {
    this.ensureSheetCountMatches();
    this.pages.forEach((page, idx) => {
      const entry = this.sheetElements[idx];
      if (!entry) return;
      this.renderBackground(entry.bgCtx, entry.bgCanvas.width, entry.bgCanvas.height, page.bgStyle);
      this.renderPageForeground(idx);
    });
    this.renderPagesList();
    this.updateHeaderTitle();
  }

  renderForeground(pageIdx = this.gesturePageIndex) {
    this.ensureSheetCountMatches();
    this.renderPageForeground(pageIdx);
  }

  renderPageForeground(pageIdx) {
    const entry = this.sheetElements[pageIdx];
    const page = this.pages[pageIdx];
    if (!entry || !page) return;
    const { ctx, drawCanvas } = entry;
    ctx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);

    for (const item of page.items) {
      this.drawItem(ctx, item);
      if (pageIdx === this.activePageIndex && this.selectedIds.has(item.id)) {
        const b = this.getItemBounds(item);
        ctx.save();
        ctx.strokeStyle = '#0b57a4';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 3]);
        ctx.strokeRect(b.minX - 5, b.minY - 5, b.maxX - b.minX + 10, b.maxY - b.minY + 10);
        ctx.restore();
      }
    }

    if (this.isPointerDown && pageIdx === this.gesturePageIndex) {
      if (this.activeTool === 'pen' && this.activeStrokePoints.length > 0) {
        this.drawItem(ctx, {
          kind: 'path',
          points: this.activeStrokePoints,
          color: this.currentColor,
          size: this.currentSize,
          alpha: this.currentAlpha
        });
      } else if (this.isShapeTool(this.activeTool)) {
        this.drawItem(ctx, {
          kind: 'shape',
          shapeType: this.activeTool,
          x1: this.dragStart.x,
          y1: this.dragStart.y,
          x2: this.dragCurr.x,
          y2: this.dragCurr.y,
          color: this.currentColor,
          size: this.currentSize,
          alpha: this.currentAlpha
        });
      } else if (this.activeTool === 'select' && this.marqueeRect) {
        ctx.save();
        ctx.fillStyle = 'rgba(11, 87, 164, 0.08)';
        ctx.strokeStyle = '#0b57a4';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([4, 3]);
        ctx.fillRect(this.marqueeRect.x, this.marqueeRect.y, this.marqueeRect.w, this.marqueeRect.h);
        ctx.strokeRect(this.marqueeRect.x, this.marqueeRect.y, this.marqueeRect.w, this.marqueeRect.h);
        ctx.restore();
      } else if (this.activeTool === 'laser' && this.laserTrail.length > 1) {
        ctx.save();
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(this.laserTrail[0].x, this.laserTrail[0].y);
        for (let i = 1; i < this.laserTrail.length; i++) {
          ctx.lineTo(this.laserTrail[i].x, this.laserTrail[i].y);
        }
        ctx.stroke();
        ctx.restore();
      }
    }

    // Draw remote collaborators' in-progress live strokes/shapes
    if (this.remoteLiveItems && this.remoteLiveItems.size > 0) {
      this.remoteLiveItems.forEach((entryItem) => {
        if (entryItem && entryItem.pageIndex === pageIdx && entryItem.item) {
          this.drawItem(ctx, entryItem.item);
        }
      });
    }

    if (this.activeTool === 'eraser' && this.eraserCursor && this.eraserCursor.pageIndex === pageIdx) {
      ctx.save();
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(this.eraserCursor.x, this.eraserCursor.y, 12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  renderBackground(ctx, w, h, style = 'grid') {
    if (!ctx || !w || !h) return;
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);

    if (style === 'grid') {
      const minor = 20;
      const major = 100;
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#f1f2f4';
      ctx.beginPath();
      for (let x = 0; x <= w; x += minor) {
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, h);
      }
      for (let y = 0; y <= h; y += minor) {
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(w, y + 0.5);
      }
      ctx.stroke();

      ctx.strokeStyle = '#e0e3e8';
      ctx.beginPath();
      for (let x = 0; x <= w; x += major) {
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, h);
      }
      for (let y = 0; y <= h; y += major) {
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(w, y + 0.5);
      }
      ctx.stroke();

      ctx.strokeStyle = 'rgba(225, 29, 72, 0.28)';
      ctx.beginPath();
      const leftMargin = Math.min(40, Math.round(w * 0.04));
      const rightMargin = Math.max(w - leftMargin, w - 40);
      ctx.moveTo(leftMargin + 0.5, 0);
      ctx.lineTo(leftMargin + 0.5, h);
      ctx.moveTo(rightMargin + 0.5, 0);
      ctx.lineTo(rightMargin + 0.5, h);
      ctx.stroke();
    } else if (style === 'lined') {
      const gap = 28;
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let y = gap; y < h; y += gap) {
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(w, y + 0.5);
      }
      ctx.stroke();
      ctx.strokeStyle = 'rgba(225, 29, 72, 0.3)';
      ctx.beginPath();
      ctx.moveTo(54.5, 0);
      ctx.lineTo(54.5, h);
      ctx.stroke();
    } else if (style === 'dots') {
      ctx.fillStyle = '#cbd5e1';
      for (let x = 20; x < w; x += 24) {
        for (let y = 20; y < h; y += 24) {
          ctx.fillRect(x, y, 1.5, 1.5);
        }
      }
    }
    ctx.restore();
  }

  renderPagesList() {
    const list = document.getElementById('wbPagesList');
    if (!list) return;
    list.innerHTML = '';

    this.pages.forEach((page, idx) => {
      const card = document.createElement('div');
      card.className = `wb-page-card${idx === this.activePageIndex ? ' active' : ''}`;
      card.dataset.pageIndex = String(idx);

      const num = document.createElement('span');
      num.className = 'wb-page-num';
      num.textContent = String(idx + 1);

      const thumbWrap = document.createElement('div');
      thumbWrap.className = 'wb-thumb-wrap';

      const thumbCanvas = document.createElement('canvas');
      thumbCanvas.className = 'wb-thumb-canvas';
      thumbCanvas.width = 160;
      thumbCanvas.height = 100;
      const tCtx = thumbCanvas.getContext('2d');
      this.renderBackground(tCtx, 160, 100, page.bgStyle);

      const srcW = this.sheetWidth > 0 ? this.sheetWidth : 960;
      const srcH = this.sheetHeight > 0 ? this.sheetHeight : 580;
      tCtx.save();
      tCtx.scale(160 / srcW, 100 / srcH);
      for (const item of page.items) {
        this.drawItem(tCtx, item);
      }
      tCtx.restore();

      thumbWrap.appendChild(thumbCanvas);
      card.appendChild(num);
      card.appendChild(thumbWrap);

      if (this.pages.length > 1) {
        const delBtn = document.createElement('button');
        delBtn.type = 'button';
        delBtn.className = 'wb-page-delete-btn';
        delBtn.title = `Xóa trang ${idx + 1}`;
        delBtn.innerHTML = '&times;';
        delBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.deletePage(idx);
        });
        card.appendChild(delBtn);
      }

      card.addEventListener('click', () => {
        this.scrollToPage(idx);
      });

      list.appendChild(card);
    });
  }

  scrollToPage(idx) {
    if (idx < 0 || idx >= this.pages.length) return;
    this.commitInlineText();
    this.selectedIds.clear();
    this.activePageIndex = idx;
    this.updateSidebarSelectionOnly();
    this.updateHeaderTitle();

    const targetEntry = this.sheetElements[idx];
    if (targetEntry && targetEntry.sheet && this.container) {
      this.suppressScrollSync = true;
      this.container.scrollTo({
        top: targetEntry.sheet.offsetTop,
        behavior: 'smooth'
      });
      setTimeout(() => { this.suppressScrollSync = false; }, 350);
    }
  }

  updateSidebarSelectionOnly() {
    const cards = document.querySelectorAll('#wbPagesList .wb-page-card');
    cards.forEach((c, i) => c.classList.toggle('active', i === this.activePageIndex));
  }

  deletePage(pageIdx) {
    if (this.pages.length <= 1 || pageIdx < 0 || pageIdx >= this.pages.length) return;
    this.commitInlineText();
    this.pages.splice(pageIdx, 1);

    // Re-index local undo/redo maps cleanly after splicing
    const nextUndo = new Map();
    const nextRedo = new Map();
    this.undoStacks.forEach((val, key) => {
      if (key < pageIdx) nextUndo.set(key, val);
      else if (key > pageIdx) nextUndo.set(key - 1, val);
    });
    this.redoStacks.forEach((val, key) => {
      if (key < pageIdx) nextRedo.set(key, val);
      else if (key > pageIdx) nextRedo.set(key - 1, val);
    });
    this.undoStacks = nextUndo;
    this.redoStacks = nextRedo;

    this.selectedIds.clear();
    if (this.activePageIndex >= this.pages.length) {
      this.activePageIndex = this.pages.length - 1;
    } else if (pageIdx < this.activePageIndex) {
      this.activePageIndex = Math.max(0, this.activePageIndex - 1);
    }

    this.rebuildSheetElements();
    this.renderAll();

    if (this.socket && this.socket.connected) {
      this.socket.emit('WHITEBOARD_DELETE_PAGE', {
        roomId: this.currentRoomId,
        pageIndex: pageIdx
      });
    }
  }

  isShapeTool(tool) {
    return tool && !['pen', 'eraser', 'select', 'text', 'laser'].includes(tool);
  }

  drawItem(ctx, item) {
    if (!ctx || !item) return;
    ctx.save();
    ctx.globalAlpha = typeof item.alpha === 'number' ? item.alpha : 1;
    ctx.strokeStyle = item.color || '#111827';
    ctx.fillStyle = item.color || '#111827';
    ctx.lineWidth = item.size || 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (item.kind === 'path') {
      const pts = item.points || [];
      if (pts.length === 1) {
        ctx.beginPath();
        ctx.arc(pts[0].x, pts[0].y, Math.max(1, ctx.lineWidth / 2), 0, Math.PI * 2);
        ctx.fill();
      } else if (pts.length > 1) {
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length - 1; i++) {
          const midX = (pts[i].x + pts[i + 1].x) / 2;
          const midY = (pts[i].y + pts[i + 1].y) / 2;
          ctx.quadraticCurveTo(pts[i].x, pts[i].y, midX, midY);
        }
        const last = pts[pts.length - 1];
        ctx.lineTo(last.x, last.y);
        ctx.stroke();
      }
    } else if (item.kind === 'text') {
      const fontSize = item.fontSize || 18;
      ctx.font = `500 ${fontSize}px Inter, system-ui, sans-serif`;
      ctx.textBaseline = 'top';
      const lines = String(item.text || '').split('\n');
      lines.forEach((line, idx) => {
        ctx.fillText(line, item.x, item.y + idx * (fontSize * 1.3));
      });
    } else if (item.kind === 'shape') {
      this.drawVectorShape(ctx, item);
    } else if (item.kind === 'image') {
      this.drawImageItem(ctx, item);
    }

    ctx.restore();
  }

  drawImageItem(ctx, item) {
    if (!item || !item.src) return;
    let img = this.imageCache.get(item.src);
    if (!img) {
      img = new Image();
      img.onload = () => this.renderAll();
      img.src = item.src;
      this.imageCache.set(item.src, img);
    }
    const w = Math.max(12, item.width || 160);
    const h = Math.max(12, item.height || 120);
    if (img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, item.x, item.y, w, h);
    } else {
      ctx.save();
      ctx.strokeStyle = '#94a3b8';
      ctx.setLineDash([4, 3]);
      ctx.strokeRect(item.x, item.y, w, h);
      ctx.restore();
    }
  }

  drawVectorShape(ctx, item) {
    const { shapeType, x1, y1, x2, y2 } = item;
    const isFilled = shapeType.endsWith('-fill');
    const base = isFilled ? shapeType.slice(0, -5) : shapeType;
    const minX = Math.min(x1, x2);
    const minY = Math.min(y1, y2);
    const w = Math.abs(x2 - x1);
    const h = Math.abs(y2 - y1);
    const cx = minX + w / 2;
    const cy = minY + h / 2;

    if (base === 'line' || base === 'ruler' || base === 'dashed' || base === 'dotted' || base === 'arrow' || base === 'double-arrow') {
      if (base === 'dashed') ctx.setLineDash([10, 6]);
      if (base === 'dotted') ctx.setLineDash([2, 6]);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.setLineDash([]);

      if (base === 'arrow' || base === 'double-arrow') {
        this.drawArrowHead(ctx, x1, y1, x2, y2, Math.max(10, ctx.lineWidth * 3));
      }
      if (base === 'double-arrow') {
        this.drawArrowHead(ctx, x2, y2, x1, y1, Math.max(10, ctx.lineWidth * 3));
      }
      return;
    }

    ctx.beginPath();
    if (base === 'circle') {
      const r = Math.hypot(x2 - x1, y2 - y1) / 2;
      ctx.arc((x1 + x2) / 2, (y1 + y2) / 2, Math.max(2, r), 0, Math.PI * 2);
    } else if (base === 'oval') {
      ctx.ellipse(cx, cy, Math.max(2, w / 2), Math.max(2, h / 2), 0, 0, Math.PI * 2);
    } else if (base === 'capsule') {
      const rad = Math.min(w, h) / 2;
      ctx.roundRect(minX, minY, Math.max(4, w), Math.max(4, h), rad);
    } else if (base === 'rect') {
      ctx.rect(minX, minY, Math.max(4, w), Math.max(4, h));
    } else if (base === 'right-tri') {
      ctx.moveTo(minX, minY);
      ctx.lineTo(minX + w, cy);
      ctx.lineTo(minX, minY + h);
      ctx.closePath();
    } else if (base === 'tri') {
      ctx.moveTo(cx, minY);
      ctx.lineTo(minX + w, minY + h);
      ctx.lineTo(minX, minY + h);
      ctx.closePath();
    } else if (base === 'right-angle-tri') {
      ctx.moveTo(minX, minY);
      ctx.lineTo(minX, minY + h);
      ctx.lineTo(minX + w, minY + h);
      ctx.closePath();
    } else if (base === 'diamond') {
      ctx.moveTo(cx, minY);
      ctx.lineTo(minX + w, cy);
      ctx.lineTo(cx, minY + h);
      ctx.lineTo(minX, cy);
      ctx.closePath();
    } else if (base === 'star') {
      const outer = Math.max(4, Math.min(w, h) / 2);
      const inner = outer * 0.42;
      for (let i = 0; i < 10; i++) {
        const rad = (i % 2 === 0 ? outer : inner);
        const angle = -Math.PI / 2 + (i * Math.PI) / 5;
        const px = cx + Math.cos(angle) * rad;
        const py = cy + Math.sin(angle) * rad;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
    } else {
      const sidesMap = { pentagon: 5, hexagon: 6, heptagon: 7, octagon: 8, dodecagon: 10 };
      const sides = sidesMap[base] || 6;
      const rx = Math.max(4, w / 2);
      const ry = Math.max(4, h / 2);
      for (let i = 0; i < sides; i++) {
        const angle = -Math.PI / 2 + (i * Math.PI * 2) / sides;
        const px = cx + Math.cos(angle) * rx;
        const py = cy + Math.sin(angle) * ry;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
    }

    if (isFilled) ctx.fill();
    else ctx.stroke();
  }

  drawArrowHead(ctx, fromX, fromY, toX, toY, len) {
    const angle = Math.atan2(toY - fromY, toX - fromX);
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - len * Math.cos(angle - Math.PI / 6), toY - len * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - len * Math.cos(angle + Math.PI / 6), toY - len * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
  }

  getItemBounds(item) {
    if (item.kind === 'path') {
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const p of (item.points || [])) {
        if (p.x < minX) minX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.x > maxX) maxX = p.x;
        if (p.y > maxY) maxY = p.y;
      }
      if (!Number.isFinite(minX)) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
      return { minX, minY, maxX, maxY };
    }
    if (item.kind === 'text') {
      const lines = String(item.text || '').split('\n');
      const maxLen = Math.max(1, ...lines.map(l => l.length));
      const fontSize = item.fontSize || 18;
      return {
        minX: item.x,
        minY: item.y,
        maxX: item.x + maxLen * (fontSize * 0.56),
        maxY: item.y + lines.length * (fontSize * 1.3)
      };
    }
    if (item.kind === 'image') {
      return {
        minX: item.x,
        minY: item.y,
        maxX: item.x + (item.width || 0),
        maxY: item.y + (item.height || 0)
      };
    }
    return {
      minX: Math.min(item.x1, item.x2),
      minY: Math.min(item.y1, item.y2),
      maxX: Math.max(item.x1, item.x2),
      maxY: Math.max(item.y1, item.y2)
    };
  }

  translateItem(item, dx, dy) {
    if (item.kind === 'path') {
      item.points.forEach(p => { p.x += dx; p.y += dy; });
    } else if (item.kind === 'text' || item.kind === 'image') {
      item.x += dx;
      item.y += dy;
    } else if (item.kind === 'shape') {
      item.x1 += dx;
      item.y1 += dy;
      item.x2 += dx;
      item.y2 += dy;
    }
  }

  hitTestItem(item, x, y, radius = 14) {
    if (item.kind === 'path') {
      return (item.points || []).some(p => Math.hypot(p.x - x, p.y - y) <= radius + (item.size || 2) / 2);
    }
    const b = this.getItemBounds(item);
    return x >= b.minX - radius && x <= b.maxX + radius && y >= b.minY - radius && y <= b.maxY + radius;
  }

  updateShapeMenuTriggerIcon(spec) {
    const shapeBtn = document.getElementById('wbToolShapeMenuBtn');
    if (!shapeBtn || !spec) return;
    if (spec.id === 'text') {
      shapeBtn.innerHTML = '<span class="wb-t-glyph">T</span>';
    } else {
      shapeBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="${spec.fill ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" stroke-linecap="round">${spec.svg}</svg>`;
    }
    shapeBtn.title = spec.label;
    shapeBtn.dataset.selectedShapeTool = spec.id;
  }

  buildShapesPalette() {
    const grid = document.getElementById('wbShapesGrid');
    if (!grid) return;

    this.shapeSpecs = [
      { id: 'text', label: 'Văn bản (T)', svg: '<text x="12" y="17" text-anchor="middle" font-family="Georgia,serif" font-size="16" font-weight="700" fill="currentColor" stroke="none">T</text>' },
      { id: 'line', label: 'Đoạn thẳng', svg: '<line x1="5" y1="19" x2="19" y2="5"/>' },
      { id: 'dashed', label: 'Nét đứt', svg: '<line x1="5" y1="19" x2="19" y2="5" stroke-dasharray="4 3"/>' },
      { id: 'dotted', label: 'Nét chấm', svg: '<line x1="5" y1="19" x2="19" y2="5" stroke-dasharray="1.5 3.5"/>' },
      { id: 'arrow', label: 'Mũi tên 1 chiều', svg: '<line x1="6" y1="18" x2="18" y2="6"/><polyline points="10 6 18 6 18 14"/>' },
      { id: 'double-arrow', label: 'Mũi tên 2 chiều', svg: '<line x1="6" y1="18" x2="18" y2="6"/><polyline points="11 6 18 6 18 13"/><polyline points="6 11 6 18 13 18"/>' },
      { id: 'laser', label: 'Bút chỉ Laser', svg: '<circle cx="11" cy="11" r="6"/><line x1="15.5" y1="15.5" x2="20" y2="20"/>' },
      { id: 'circle', label: 'Hình tròn', svg: '<circle cx="12" cy="12" r="7.5"/>' },
      { id: 'oval', label: 'Hình bầu dục', svg: '<ellipse cx="12" cy="12" rx="8.5" ry="5.5"/>' },
      { id: 'capsule', label: 'Hình viên nang', svg: '<rect x="4" y="7" width="16" height="10" rx="5"/>' },
      { id: 'rect', label: 'Hình chữ nhật / vuông', svg: '<rect x="5" y="5" width="14" height="14"/>' },
      { id: 'right-tri', label: 'Tam giác ngang', svg: '<polygon points="6,5 19,12 6,19"/>' },
      { id: 'tri', label: 'Tam giác cân', svg: '<polygon points="12,5 19,18 5,18"/>' },
      { id: 'right-angle-tri', label: 'Tam giác vuông', svg: '<polygon points="6,5 6,19 19,19"/>' },
      { id: 'diamond', label: 'Hình thoi', svg: '<polygon points="12,4 20,12 12,20 4,12"/>' },
      { id: 'pentagon', label: 'Ngũ giác', svg: '<polygon points="12,4 19.5,9.5 16.5,18.5 7.5,18.5 4.5,9.5"/>' },
      { id: 'hexagon', label: 'Lục giác', svg: '<polygon points="12,4 19,8 19,16 12,20 5,16 5,8"/>' },
      { id: 'heptagon', label: 'Thất giác', svg: '<polygon points="12,4 18,7 20,13.5 15.5,19 8.5,19 4,13.5 6,7"/>' },
      { id: 'octagon', label: 'Bát giác', svg: '<polygon points="9,4 15,4 20,9 20,15 15,20 9,20 4,15 4,9"/>' },
      { id: 'dodecagon', label: 'Đa giác tròn', svg: '<circle cx="12" cy="12" r="8" stroke-dasharray="3 1"/>' },
      { id: 'star', label: 'Ngôi sao', svg: '<polygon points="12,3.5 14.6,8.8 20.4,9.6 16.2,13.7 17.2,19.5 12,16.7 6.8,19.5 7.8,13.7 3.6,9.6 9.4,8.8"/>' },
      { id: 'circle-fill', label: 'Hình tròn đặc', fill: true, svg: '<circle cx="12" cy="12" r="7.5"/>' },
      { id: 'oval-fill', label: 'Bầu dục đặc', fill: true, svg: '<ellipse cx="12" cy="12" rx="8.5" ry="5.5"/>' },
      { id: 'capsule-fill', label: 'Viên nang đặc', fill: true, svg: '<rect x="4" y="7" width="16" height="10" rx="5"/>' },
      { id: 'rect-fill', label: 'Hình vuông đặc', fill: true, svg: '<rect x="5" y="5" width="14" height="14"/>' },
      { id: 'right-tri-fill', label: 'Tam giác ngang đặc', fill: true, svg: '<polygon points="6,5 19,12 6,19"/>' },
      { id: 'tri-fill', label: 'Tam giác cân đặc', fill: true, svg: '<polygon points="12,5 19,18 5,18"/>' },
      { id: 'right-angle-tri-fill', label: 'Tam giác vuông đặc', fill: true, svg: '<polygon points="6,5 6,19 19,19"/>' },
      { id: 'diamond-fill', label: 'Hình thoi đặc', fill: true, svg: '<polygon points="12,4 20,12 12,20 4,12"/>' },
      { id: 'pentagon-fill', label: 'Ngũ giác đặc', fill: true, svg: '<polygon points="12,4 19.5,9.5 16.5,18.5 7.5,18.5 4.5,9.5"/>' },
      { id: 'hexagon-fill', label: 'Lục giác đặc', fill: true, svg: '<polygon points="12,4 19,8 19,16 12,20 5,16 5,8"/>' },
      { id: 'heptagon-fill', label: 'Thất giác đặc', fill: true, svg: '<polygon points="12,4 18,7 20,13.5 15.5,19 8.5,19 4,13.5 6,7"/>' },
      { id: 'octagon-fill', label: 'Bát giác đặc', fill: true, svg: '<polygon points="9,4 15,4 20,9 20,15 15,20 9,20 4,15 4,9"/>' },
      { id: 'dodecagon-fill', label: 'Đa giác đặc', fill: true, svg: '<circle cx="12" cy="12" r="8"/>' },
      { id: 'star-fill', label: 'Ngôi sao đặc', fill: true, svg: '<polygon points="12,3.5 14.6,8.8 20.4,9.6 16.2,13.7 17.2,19.5 12,16.7 6.8,19.5 7.8,13.7 3.6,9.6 9.4,8.8"/>' }
    ];

    grid.innerHTML = '';
    this.shapeSpecs.forEach(spec => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `wb-shape-opt${spec.id === 'text' ? ' active' : ''}`;
      btn.dataset.tool = spec.id;
      btn.title = spec.label;
      btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="${spec.fill ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round">${spec.svg}</svg>`;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.lastShapeTool = spec.id;
        this.updateShapeMenuTriggerIcon(spec);
        this.selectTool(spec.id);
        grid.querySelectorAll('.wb-shape-opt').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.closeShapesPopover();
      });
      grid.appendChild(btn);
    });
  }

  selectTool(toolName) {
    this.commitInlineText();
    this.activeTool = toolName;
    if (toolName !== 'select') {
      this.selectedIds.clear();
    }
    const penBtn = document.getElementById('wbToolPen');
    const rulerBtn = document.getElementById('wbToolRuler');
    const shapeBtn = document.getElementById('wbToolShapeMenuBtn');
    const eraserBtn = document.getElementById('wbToolEraser');
    const selectBtn = document.getElementById('wbToolSelect');

    [penBtn, rulerBtn, shapeBtn, eraserBtn, selectBtn].forEach(b => b && b.classList.remove('active'));
    if (toolName === 'pen' && penBtn) penBtn.classList.add('active');
    else if (toolName === 'ruler' && rulerBtn) rulerBtn.classList.add('active');
    else if (toolName === 'eraser' && eraserBtn) eraserBtn.classList.add('active');
    else if (toolName === 'select' && selectBtn) selectBtn.classList.add('active');
    else if (shapeBtn) shapeBtn.classList.add('active');

    if (this.container) {
      this.container.style.cursor = toolName === 'text' ? 'text' : (toolName === 'select' ? 'default' : 'crosshair');
    }
    this.renderPageForeground(this.activePageIndex);
  }

  closeShapesPopover() {
    const pop = document.getElementById('wbShapesPopover');
    if (pop) pop.classList.add('hidden');
  }

  setupToolbarListeners() {
    const toggleSidebarBtn = document.getElementById('wbToggleSidebarBtn');
    const sidebar = document.getElementById('wbPagesSidebar');
    if (toggleSidebarBtn && sidebar) {
      toggleSidebarBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        setTimeout(() => this.resizeCanvases(), 200);
      });
    }

    const saveBtn = document.getElementById('wbSaveBtn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.exportCurrentPagePng());
    }

    const undoBtn = document.getElementById('wbUndoBtn');
    if (undoBtn) undoBtn.addEventListener('click', () => this.undo());

    const redoBtn = document.getElementById('wbRedoBtn');
    if (redoBtn) redoBtn.addEventListener('click', () => this.redo());

    const clearBtn = document.getElementById('wbClearBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.pushUndoSnapshot(this.activePageIndex);
        this.getActivePage().items = [];
        this.selectedIds.clear();
        this.renderAll();
        this.emitSyncPage(this.activePageIndex);
      });
    }

    const addPageBtn = document.getElementById('wbAddPageBtn');
    if (addPageBtn) {
      addPageBtn.addEventListener('click', () => this.addPage());
    }

    const bgBtn = document.getElementById('wbBgToggleBtn');
    if (bgBtn) {
      bgBtn.addEventListener('click', () => {
        const page = this.getActivePage();
        const curIdx = this.bgStylesOrder.indexOf(page.bgStyle || 'grid');
        page.bgStyle = this.bgStylesOrder[(curIdx + 1) % this.bgStylesOrder.length];
        this.renderAll();
        this.emitSyncPage(this.activePageIndex);
      });
    }

    const imageBtn = document.getElementById('wbImageBtn');
    const imageFileInput = document.getElementById('wbImageFileInput');
    if (imageBtn && imageFileInput) {
      imageBtn.addEventListener('click', () => imageFileInput.click());
      imageFileInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) this.insertImageFile(file);
        imageFileInput.value = '';
      });
    }

    window.addEventListener('paste', (e) => {
      if (!this.modal || this.modal.classList.contains('hidden')) return;
      const activeId = document.activeElement ? document.activeElement.id : '';
      if (activeId === 'wbInlineTextInput') return;
      const items = e.clipboardData && e.clipboardData.items ? Array.from(e.clipboardData.items) : [];
      const imgEntry = items.find(it => it.type && it.type.startsWith('image/'));
      if (!imgEntry) return;
      const file = imgEntry.getAsFile();
      if (file) {
        e.preventDefault();
        this.insertImageFile(file);
      }
    });

    if (this.container) {
      this.container.addEventListener('dragover', (e) => {
        if (this.modal && !this.modal.classList.contains('hidden')) {
          e.preventDefault();
        }
      });
      this.container.addEventListener('drop', (e) => {
        if (!this.modal || this.modal.classList.contains('hidden')) return;
        const file = e.dataTransfer && e.dataTransfer.files && Array.from(e.dataTransfer.files).find(f => f.type && f.type.startsWith('image/'));
        if (file) {
          e.preventDefault();
          this.insertImageFile(file);
        }
      });
    }

    const dotBtns = document.querySelectorAll('#wbInkDots .wb-dot-btn');
    dotBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        dotBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentColor = btn.dataset.color || '#111827';
        this.currentSize = parseFloat(btn.dataset.size) || 3;
        this.currentAlpha = parseFloat(btn.dataset.alpha) || 1;
        if (this.activeTool === 'eraser' || this.activeTool === 'select') {
          this.selectTool('pen');
        }
      });
    });

    const penBtn = document.getElementById('wbToolPen');
    if (penBtn) penBtn.addEventListener('click', () => { this.closeShapesPopover(); this.selectTool('pen'); });

    const rulerBtn = document.getElementById('wbToolRuler');
    if (rulerBtn) rulerBtn.addEventListener('click', () => { this.closeShapesPopover(); this.selectTool('ruler'); });

    const shapeMenuBtn = document.getElementById('wbToolShapeMenuBtn');
    const pop = document.getElementById('wbShapesPopover');
    if (shapeMenuBtn && pop) {
      shapeMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        pop.classList.toggle('hidden');
      });
    }

    const eraserBtn = document.getElementById('wbToolEraser');
    if (eraserBtn) eraserBtn.addEventListener('click', () => { this.closeShapesPopover(); this.selectTool('eraser'); });

    const selectBtn = document.getElementById('wbToolSelect');
    if (selectBtn) selectBtn.addEventListener('click', () => { this.closeShapesPopover(); this.selectTool('select'); });

    const closeBtn = document.getElementById('whiteboardCloseBtn');
    if (closeBtn) closeBtn.addEventListener('click', () => this.close());

    const overlay = document.getElementById('whiteboardOverlay');
    if (overlay) overlay.addEventListener('click', () => this.close());

    // Keep sidebar highlight & "Untitled (i/N)" synced while scrolling continuously across connected sheets
    if (this.container) {
      this.container.addEventListener('scroll', () => {
        if (this.suppressScrollSync || this.sheetElements.length === 0) return;
        const centerY = this.container.scrollTop + this.container.clientHeight * 0.4;
        let detected = 0;
        for (let i = 0; i < this.sheetElements.length; i++) {
          const sheet = this.sheetElements[i].sheet;
          if (centerY >= sheet.offsetTop) detected = i;
        }
        if (detected !== this.activePageIndex) {
          this.activePageIndex = detected;
          this.updateSidebarSelectionOnly();
          this.updateHeaderTitle();
        }
      });
    }

    window.addEventListener('resize', () => {
      if (this.modal && !this.modal.classList.contains('hidden')) {
        this.resizeCanvases();
      }
    });

    window.addEventListener('keydown', (e) => {
      if (!this.modal || this.modal.classList.contains('hidden')) return;
      const activeTag = document.activeElement ? document.activeElement.tagName : '';
      if (activeTag === 'TEXTAREA' || activeTag === 'INPUT') return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        this.undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        this.redo();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (this.selectedIds.size > 0) {
          this.pushUndoSnapshot(this.activePageIndex);
          const page = this.getActivePage();
          page.items = page.items.filter(it => !this.selectedIds.has(it.id));
          this.selectedIds.clear();
          this.renderAll();
          this.emitSyncPage(this.activePageIndex);
        }
      } else if (e.key === 'Escape') {
        if (pop && !pop.classList.contains('hidden')) this.closeShapesPopover();
        else this.close();
      }
    });
  }

  resolveSheetFromEvent(e) {
    const pt = e.touches && e.touches[0] ? e.touches[0] : e;
    const targetSheet = e.target && e.target.closest ? e.target.closest('.wb-page-sheet') : null;
    let idx = targetSheet ? parseInt(targetSheet.dataset.pageIndex, 10) : this.activePageIndex;
    if (!Number.isInteger(idx) || idx < 0 || idx >= this.sheetElements.length) {
      idx = this.gesturePageIndex;
    }
    const entry = this.sheetElements[idx] || this.sheetElements[0];
    const rect = entry.drawCanvas.getBoundingClientRect();
    return {
      pageIndex: idx,
      x: Math.round((pt.clientX - rect.left) * 10) / 10,
      y: Math.round((pt.clientY - rect.top) * 10) / 10
    };
  }

  setupStackListeners() {
    const startPointer = (e) => {
      if (!e.target.closest('.wb-page-sheet')) return;
      this.closeShapesPopover();
      const hitInfo = this.resolveSheetFromEvent(e);
      this.gesturePageIndex = hitInfo.pageIndex;
      if (this.activePageIndex !== hitInfo.pageIndex) {
        this.activePageIndex = hitInfo.pageIndex;
        this.updateSidebarSelectionOnly();
        this.updateHeaderTitle();
      }
      const coords = { x: hitInfo.x, y: hitInfo.y };

      if (this.activeTool === 'text') {
        if (e.cancelable) e.preventDefault();
        this.openInlineTextAt(hitInfo.pageIndex, coords.x, coords.y);
        return;
      }

      this.isPointerDown = true;
      this.dragStart = coords;
      this.dragCurr = coords;

      if (this.activeTool === 'pen') {
        this.activeStrokePoints = [coords];
        this.renderPageForeground(hitInfo.pageIndex);
      } else if (this.activeTool === 'eraser') {
        this.pushUndoSnapshot(hitInfo.pageIndex);
        this.eraseAt(hitInfo.pageIndex, coords.x, coords.y);
      } else if (this.activeTool === 'select') {
        const page = this.pages[hitInfo.pageIndex];
        const hit = [...page.items].reverse().find(it => this.hitTestItem(it, coords.x, coords.y, 8));
        if (hit && this.selectedIds.has(hit.id)) {
          this.isMovingSelection = true;
          this.selectionMoveLast = coords;
          this.movedSelectionFlag = false;
          this.pushUndoSnapshot(hitInfo.pageIndex);
        } else if (hit) {
          this.selectedIds = new Set([hit.id]);
          this.isMovingSelection = true;
          this.selectionMoveLast = coords;
          this.movedSelectionFlag = false;
          this.pushUndoSnapshot(hitInfo.pageIndex);
          this.renderPageForeground(hitInfo.pageIndex);
        } else {
          this.selectedIds.clear();
          this.isMovingSelection = false;
          this.marqueeRect = { x: coords.x, y: coords.y, w: 0, h: 0 };
          this.renderPageForeground(hitInfo.pageIndex);
        }
      } else if (this.activeTool === 'laser') {
        this.laserTrail = [coords];
        this.renderPageForeground(hitInfo.pageIndex);
      }
    };

    const movePointer = (e) => {
      const targetSheet = e.target && e.target.closest ? e.target.closest('.wb-page-sheet') : null;
      if (!this.isPointerDown && !targetSheet) return;
      const hoverInfo = !this.isPointerDown ? this.resolveSheetFromEvent(e) : null;
      const pageIdx = this.isPointerDown ? this.gesturePageIndex : hoverInfo.pageIndex;
      const entry = this.sheetElements[pageIdx];
      if (!entry) return;
      const pt = e.touches && e.touches[0] ? e.touches[0] : e;
      const rect = entry.drawCanvas.getBoundingClientRect();
      const coords = {
        x: Math.round((pt.clientX - rect.left) * 10) / 10,
        y: Math.round((pt.clientY - rect.top) * 10) / 10
      };

      this.lastPointerPos = { pageIndex: pageIdx, x: coords.x, y: coords.y };
      this.emitCursor(pageIdx, coords.x, coords.y, true);

      if (this.activeTool === 'eraser') {
        this.eraserCursor = { pageIndex: pageIdx, x: coords.x, y: coords.y };
      } else {
        this.eraserCursor = null;
      }

      if (!this.isPointerDown) {
        if (this.activeTool === 'eraser' && this.eraserCursor) {
          this.renderPageForeground(this.eraserCursor.pageIndex);
        }
        return;
      }
      e.preventDefault();
      this.dragCurr = coords;

      if (this.activeTool === 'pen') {
        this.activeStrokePoints.push(coords);
        this.renderPageForeground(this.gesturePageIndex);
        this.emitLiveStroke(this.gesturePageIndex, true);
      } else if (this.activeTool === 'eraser') {
        this.eraseAt(this.gesturePageIndex, coords.x, coords.y);
      } else if (this.isShapeTool(this.activeTool)) {
        this.renderPageForeground(this.gesturePageIndex);
        this.emitLiveStroke(this.gesturePageIndex, true);
      } else if (this.activeTool === 'select') {
        if (this.isMovingSelection && this.selectionMoveLast) {
          const dx = coords.x - this.selectionMoveLast.x;
          const dy = coords.y - this.selectionMoveLast.y;
          if (dx !== 0 || dy !== 0) {
            this.movedSelectionFlag = true;
            const page = this.pages[this.gesturePageIndex];
            page.items.forEach(it => {
              if (this.selectedIds.has(it.id)) this.translateItem(it, dx, dy);
            });
            this.selectionMoveLast = coords;
          }
        } else {
          this.marqueeRect = {
            x: Math.min(this.dragStart.x, coords.x),
            y: Math.min(this.dragStart.y, coords.y),
            w: Math.abs(coords.x - this.dragStart.x),
            h: Math.abs(coords.y - this.dragStart.y)
          };
        }
        this.renderPageForeground(this.gesturePageIndex);
      } else if (this.activeTool === 'laser') {
        this.laserTrail.push(coords);
        if (this.laserTrail.length > 24) this.laserTrail.shift();
        this.renderPageForeground(this.gesturePageIndex);
      }
    };

    const endPointer = () => {
      if (!this.isPointerDown) return;
      this.isPointerDown = false;
      const pageIdx = this.gesturePageIndex;
      this.emitLiveStroke(pageIdx, false);

      if (this.activeTool === 'pen' && this.activeStrokePoints.length > 0) {
        this.pushUndoSnapshot(pageIdx);
        const item = {
          id: `item_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          kind: 'path',
          points: this.activeStrokePoints.slice(),
          color: this.currentColor,
          size: this.currentSize,
          alpha: this.currentAlpha
        };
        this.activeStrokePoints = [];
        this.commitNewItem(pageIdx, item);
      } else if (this.isShapeTool(this.activeTool)) {
        const dist = Math.hypot(this.dragCurr.x - this.dragStart.x, this.dragCurr.y - this.dragStart.y);
        if (dist >= 4) {
          this.pushUndoSnapshot(pageIdx);
          const item = {
            id: `item_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            kind: 'shape',
            shapeType: this.activeTool,
            x1: this.dragStart.x,
            y1: this.dragStart.y,
            x2: this.dragCurr.x,
            y2: this.dragCurr.y,
            color: this.currentColor,
            size: this.currentSize,
            alpha: this.currentAlpha
          };
          this.commitNewItem(pageIdx, item);
        } else {
          this.renderPageForeground(pageIdx);
        }
      } else if (this.activeTool === 'eraser') {
        this.renderPagesList();
        this.emitSyncPage(pageIdx);
      } else if (this.activeTool === 'select') {
        if (this.isMovingSelection) {
          if (this.movedSelectionFlag) {
            this.renderPagesList();
            this.emitSyncPage(pageIdx);
          } else {
            this.getStack(this.undoStacks, pageIdx).pop();
          }
        } else if (this.marqueeRect) {
          const r = this.marqueeRect;
          const page = this.pages[pageIdx];
          page.items.forEach(it => {
            const b = this.getItemBounds(it);
            const overlap = !(b.maxX < r.x || b.minX > r.x + r.w || b.maxY < r.y || b.minY > r.y + r.h);
            if (overlap) this.selectedIds.add(it.id);
          });
        }
        this.marqueeRect = null;
        this.isMovingSelection = false;
        this.selectionMoveLast = null;
        this.renderPageForeground(pageIdx);
      } else if (this.activeTool === 'laser') {
        setTimeout(() => {
          this.laserTrail = [];
          this.renderPageForeground(pageIdx);
        }, 350);
      }
    };

    this.pagesStack.addEventListener('mousedown', startPointer);
    this.pagesStack.addEventListener('mousemove', movePointer);
    window.addEventListener('mouseup', endPointer);
    this.pagesStack.addEventListener('mouseleave', () => {
      this.eraserCursor = null;
      this.emitCursor(this.activePageIndex, 0, 0, false);
      if (!this.isPointerDown) this.renderPageForeground(this.activePageIndex);
    });
    this.pagesStack.addEventListener('touchstart', startPointer, { passive: false });
    this.pagesStack.addEventListener('touchmove', movePointer, { passive: false });
    this.pagesStack.addEventListener('touchend', endPointer);

    const input = document.getElementById('wbInlineTextInput');
    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.commitInlineText();
        } else if (e.key === 'Escape') {
          this.pendingTextPos = null;
          input.value = '';
          input.classList.add('hidden');
        }
      });
      input.addEventListener('blur', () => this.commitInlineText());
    }
  }

  openInlineTextAt(pageIndex, x, y) {
    this.commitInlineText();
    const input = document.getElementById('wbInlineTextInput');
    const entry = this.sheetElements[pageIndex];
    if (!input || !entry) return;
    this.pendingTextPos = { pageIndex, x, y };
    input.style.left = `${x}px`;
    input.style.top = `${entry.sheet.offsetTop + y}px`;
    input.style.color = this.currentColor;
    input.value = '';
    input.classList.remove('hidden');
    input.focus();
    setTimeout(() => {
      if (this.pendingTextPos && !input.classList.contains('hidden')) {
        input.focus();
      }
    }, 15);
  }

  commitInlineText() {
    const input = document.getElementById('wbInlineTextInput');
    if (!input || input.classList.contains('hidden') || !this.pendingTextPos) return;
    const text = input.value.trim();
    const pos = this.pendingTextPos;
    this.pendingTextPos = null;
    input.value = '';
    input.classList.add('hidden');
    if (!text) return;

    this.pushUndoSnapshot(pos.pageIndex);
    const item = {
      id: `item_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      kind: 'text',
      x: pos.x,
      y: pos.y,
      text,
      fontSize: 18,
      color: this.currentColor,
      alpha: 1
    };
    this.commitNewItem(pos.pageIndex, item);
  }

  eraseAt(pageIndex, x, y) {
    const page = this.pages[pageIndex];
    if (!page) return;
    const prevLen = page.items.length;
    page.items = page.items.filter(it => !this.hitTestItem(it, x, y, 14));
    if (page.items.length !== prevLen) {
      this.renderPageForeground(pageIndex);
    }
  }

  commitNewItem(pageIndex, item) {
    const page = this.pages[pageIndex];
    if (!page) return;
    page.items.push(item);
    this.renderPageForeground(pageIndex);
    this.renderPagesList();
    this.updateHeaderTitle();
    if (this.socket && this.socket.connected) {
      this.socket.emit('WHITEBOARD_ADD_ITEM', {
        roomId: this.currentRoomId,
        pageIndex,
        item
      });
    }
  }

  addPage() {
    this.commitInlineText();
    const newPage = {
      id: `page_${this.pages.length + 1}_${Date.now().toString(36)}`,
      bgStyle: this.getActivePage().bgStyle || 'grid',
      items: []
    };
    this.pages.push(newPage);
    this.rebuildSheetElements();
    this.renderAll();
    this.scrollToPage(this.pages.length - 1);
    if (this.socket && this.socket.connected) {
      this.socket.emit('WHITEBOARD_ADD_PAGE', {
        roomId: this.currentRoomId,
        page: newPage
      });
    }
  }

  undo() {
    const undo = this.getStack(this.undoStacks, this.activePageIndex);
    if (undo.length === 0) return;
    const redo = this.getStack(this.redoStacks, this.activePageIndex);
    redo.push(JSON.stringify(this.getActivePage()));
    this.pages[this.activePageIndex] = JSON.parse(undo.pop());
    this.selectedIds.clear();
    this.renderAll();
    this.emitSyncPage(this.activePageIndex);
  }

  redo() {
    const redo = this.getStack(this.redoStacks, this.activePageIndex);
    if (redo.length === 0) return;
    const undo = this.getStack(this.undoStacks, this.activePageIndex);
    undo.push(JSON.stringify(this.getActivePage()));
    this.pages[this.activePageIndex] = JSON.parse(redo.pop());
    this.selectedIds.clear();
    this.renderAll();
    this.emitSyncPage(this.activePageIndex);
  }

  emitSyncPage(pageIdx = this.activePageIndex) {
    if (this.socket && this.socket.connected && this.pages[pageIdx]) {
      this.socket.emit('WHITEBOARD_SYNC_PAGE', {
        roomId: this.currentRoomId,
        pageIndex: pageIdx,
        page: this.pages[pageIdx]
      });
    }
  }

  exportCurrentPagePng() {
    if (this.sheetElements.length === 0) return;
    const totalH = this.sheetElements.reduce((sum, e) => sum + e.bgCanvas.height, 0);
    const merged = document.createElement('canvas');
    merged.width = this.sheetWidth;
    merged.height = totalH;
    const mCtx = merged.getContext('2d');
    let yOff = 0;
    this.sheetElements.forEach(e => {
      mCtx.drawImage(e.bgCanvas, 0, yOff);
      mCtx.drawImage(e.drawCanvas, 0, yOff);
      yOff += e.bgCanvas.height;
    });

    const link = document.createElement('a');
    link.download = `whiteboard-${this.pages.length}-pages.png`;
    link.href = merged.toDataURL('image/png');
    link.click();
  }

  setupSocketListeners() {
    if (!this.socket) return;

    this.socket.on('WHITEBOARD_STATE', ({ roomId, pages }) => {
      if (roomId !== this.currentRoomId || !Array.isArray(pages) || pages.length === 0) return;
      this.pages = pages.map((p, idx) => ({
        id: p.id || `page_${idx + 1}`,
        bgStyle: p.bgStyle || 'grid',
        items: Array.isArray(p.items) ? p.items : []
      }));
      if (this.activePageIndex >= this.pages.length) {
        this.activePageIndex = this.pages.length - 1;
      }
      this.rebuildSheetElements();
      this.renderAll();
    });

    this.socket.on('WHITEBOARD_ADD_ITEM', ({ roomId, pageIndex, item }) => {
      if (roomId !== this.currentRoomId || !item) return;
      let addedPage = false;
      while (this.pages.length <= pageIndex) {
        this.pages.push({ id: `page_${this.pages.length + 1}`, bgStyle: 'grid', items: [] });
        addedPage = true;
      }
      const page = this.pages[pageIndex];
      if (!page.items.some(x => x.id === item.id)) {
        page.items.push(item);
      }
      if (addedPage) {
        this.rebuildSheetElements();
        this.renderAll();
      } else {
        this.renderPageForeground(pageIndex);
        this.renderPagesList();
        this.updateHeaderTitle();
      }
    });

    this.socket.on('WHITEBOARD_SYNC_PAGE', ({ roomId, pageIndex, page }) => {
      if (roomId !== this.currentRoomId || !page) return;
      let addedPage = false;
      while (this.pages.length <= pageIndex) {
        this.pages.push({ id: `page_${this.pages.length + 1}`, bgStyle: 'grid', items: [] });
        addedPage = true;
      }
      this.pages[pageIndex] = {
        id: page.id || `page_${pageIndex + 1}`,
        bgStyle: page.bgStyle || 'grid',
        items: Array.isArray(page.items) ? page.items : []
      };
      if (addedPage) this.rebuildSheetElements();
      this.renderAll();
    });

    this.socket.on('WHITEBOARD_ADD_PAGE', ({ roomId, page }) => {
      if (roomId !== this.currentRoomId || !page) return;
      this.pages.push({
        id: page.id || `page_${this.pages.length + 1}`,
        bgStyle: page.bgStyle || 'grid',
        items: Array.isArray(page.items) ? page.items : []
      });
      this.rebuildSheetElements();
      this.renderAll();
    });

    this.socket.on('CLEAR_BOARD', ({ roomId, pageIndex = 0 }) => {
      if (roomId !== this.currentRoomId || !this.pages[pageIndex]) return;
      this.pages[pageIndex].items = [];
      this.renderAll();
    });

    this.socket.on('WHITEBOARD_CURSOR', (data) => {
      if (!data || data.roomId !== this.currentRoomId || !data.senderId) return;
      if (!data.visible) {
        this.remoteCursors.delete(data.senderId);
      } else {
        this.remoteCursors.set(data.senderId, {
          senderId: data.senderId,
          userName: data.userName || 'Đồng nghiệp',
          color: data.color || '#2563eb',
          pageIndex: typeof data.pageIndex === 'number' ? data.pageIndex : 0,
          x: typeof data.x === 'number' ? data.x : 0,
          y: typeof data.y === 'number' ? data.y : 0,
          updatedAt: Date.now()
        });
      }
      this.renderRemoteCursors();
    });

    this.socket.on('WHITEBOARD_CURSOR_REMOVE', ({ senderId }) => {
      if (!senderId) return;
      let changed = false;
      if (this.remoteCursors.delete(senderId)) changed = true;
      const liveEntry = this.remoteLiveItems.get(senderId);
      if (liveEntry) {
        this.remoteLiveItems.delete(senderId);
        this.renderPageForeground(liveEntry.pageIndex);
      }
      if (changed) this.renderRemoteCursors();
    });

    this.socket.on('WHITEBOARD_LIVE_STROKE', (data) => {
      if (!data || data.roomId !== this.currentRoomId || !data.senderId) return;
      if (!data.active || !data.item) {
        const prev = this.remoteLiveItems.get(data.senderId);
        this.remoteLiveItems.delete(data.senderId);
        if (prev) this.renderPageForeground(prev.pageIndex);
        return;
      }
      const pageIdx = typeof data.pageIndex === 'number' ? data.pageIndex : 0;
      this.remoteLiveItems.set(data.senderId, { pageIndex: pageIdx, item: data.item });
      this.renderPageForeground(pageIdx);
    });
  }

  emitCursor(pageIndex, x, y, visible = true) {
    if (!this.socket || !this.socket.connected || !this.currentRoomId) return;
    const now = performance.now();
    if (visible && now - this.lastCursorEmitTime < 33) return;
    this.lastCursorEmitTime = now;
    const me = window.mapEngineInstance;
    const userName = this.localUserName || (me && me.player && me.player.name) || 'Bạn';
    this.socket.emit('WHITEBOARD_CURSOR', {
      roomId: this.currentRoomId,
      pageIndex,
      x,
      y,
      userName,
      visible
    });
  }

  emitLiveStroke(pageIndex, active = true) {
    if (!this.socket || !this.socket.connected || !this.currentRoomId) return;
    if (!active) {
      this.lastLiveStrokeEmitTime = 0;
      this.socket.emit('WHITEBOARD_LIVE_STROKE', {
        roomId: this.currentRoomId,
        pageIndex,
        active: false,
        item: null
      });
      return;
    }
    const now = performance.now();
    if (now - this.lastLiveStrokeEmitTime < 33) return;
    this.lastLiveStrokeEmitTime = now;

    let item = null;
    if (this.activeTool === 'pen' && this.activeStrokePoints.length > 0) {
      item = {
        kind: 'path',
        points: this.activeStrokePoints.slice(),
        color: this.currentColor,
        size: this.currentSize,
        alpha: this.currentAlpha
      };
    } else if (this.isShapeTool(this.activeTool)) {
      item = {
        kind: 'shape',
        shapeType: this.activeTool,
        x1: this.dragStart.x,
        y1: this.dragStart.y,
        x2: this.dragCurr.x,
        y2: this.dragCurr.y,
        color: this.currentColor,
        size: this.currentSize,
        alpha: this.currentAlpha
      };
    }
    if (!item) return;

    this.socket.emit('WHITEBOARD_LIVE_STROKE', {
      roomId: this.currentRoomId,
      pageIndex,
      active: true,
      item
    });
  }

  pruneStaleRemoteCursors() {
    if (!this.remoteCursors || this.remoteCursors.size === 0) return;
    const now = Date.now();
    let changed = false;
    this.remoteCursors.forEach((cur, sid) => {
      if (now - (cur.updatedAt || 0) > 6000) {
        this.remoteCursors.delete(sid);
        changed = true;
      }
    });
    if (changed) this.renderRemoteCursors();
  }

  renderRemoteCursors() {
    if (!this.cursorsLayer) {
      this.cursorsLayer = document.getElementById('wbRemoteCursorsLayer');
    }
    if (!this.cursorsLayer) return;

    if (!this.modal || this.modal.classList.contains('hidden') || this.remoteCursors.size === 0) {
      this.cursorsLayer.innerHTML = '';
      return;
    }

    const activeIds = new Set();
    this.remoteCursors.forEach((cur, sid) => {
      const entry = this.sheetElements[cur.pageIndex] || this.sheetElements[0];
      if (!entry || !entry.sheet) return;
      activeIds.add(sid);

      const safeId = `wbCursor_${String(sid).replace(/[^a-zA-Z0-9_-]/g, '_')}`;
      let el = document.getElementById(safeId);
      if (!el) {
        el = document.createElement('div');
        el.id = safeId;
        el.className = 'wb-remote-cursor';
        el.dataset.senderId = sid;
        el.innerHTML = `
          <div class="wb-remote-cursor-label"></div>
          <svg class="wb-remote-cursor-arrow" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 2l16 10-7.2 1.8L10 21 4 2z" stroke="#ffffff" stroke-width="1.8" stroke-linejoin="round"></path>
          </svg>
        `;
        this.cursorsLayer.appendChild(el);
      }

      const maxX = entry.sheet.clientWidth || this.sheetWidth || 960;
      const maxY = entry.sheet.clientHeight || this.sheetHeight || 580;
      const px = (entry.sheet.offsetLeft || 0) + Math.max(0, Math.min(cur.x, maxX));
      const py = (entry.sheet.offsetTop || 0) + Math.max(0, Math.min(cur.y, maxY));
      const color = cur.color || '#2563eb';

      el.style.setProperty('--cursor-color', color);
      el.style.transform = `translate3d(${px}px, ${py}px, 0)`;
      const pathEl = el.querySelector('.wb-remote-cursor-arrow path');
      if (pathEl) pathEl.setAttribute('fill', color);
      const labelEl = el.querySelector('.wb-remote-cursor-label');
      if (labelEl) labelEl.textContent = cur.userName || 'Đồng nghiệp';
    });

    // Remove DOM nodes for cursors no longer active
    Array.from(this.cursorsLayer.querySelectorAll('.wb-remote-cursor')).forEach((node) => {
      if (!activeIds.has(node.dataset.senderId)) {
        node.remove();
      }
    });
  }

  insertImageFile(file) {
    if (!file || !file.type || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        this.insertImageDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  insertImageDataUrl(rawDataUrl) {
    if (!rawDataUrl) return;
    const img = new Image();
    img.onload = () => {
      const natW = img.naturalWidth || 240;
      const natH = img.naturalHeight || 180;

      // Downscale oversized clipboard screenshots so Socket.IO sync stays fast and lightweight
      const maxEncodeDim = 760;
      const encodeScale = Math.min(1, maxEncodeDim / Math.max(natW, natH));
      const ew = Math.max(1, Math.round(natW * encodeScale));
      const eh = Math.max(1, Math.round(natH * encodeScale));
      const off = document.createElement('canvas');
      off.width = ew;
      off.height = eh;
      const octx = off.getContext('2d');
      octx.drawImage(img, 0, 0, ew, eh);
      const isPng = rawDataUrl.startsWith('data:image/png');
      const encodedSrc = isPng && ew * eh <= 360000
        ? off.toDataURL('image/png')
        : off.toDataURL('image/jpeg', 0.84);

      const maxDisplayW = Math.min(380, Math.round((this.sheetWidth || 960) * 0.52));
      const maxDisplayH = Math.min(300, Math.round((this.sheetHeight || 580) * 0.56));
      const dispScale = Math.min(1, maxDisplayW / natW, maxDisplayH / natH);
      const dispW = Math.max(48, Math.round(natW * dispScale));
      const dispH = Math.max(48, Math.round(natH * dispScale));

      const pageIdx = (this.lastPointerPos && this.lastPointerPos.pageIndex >= 0 && this.lastPointerPos.pageIndex < this.pages.length)
        ? this.lastPointerPos.pageIndex
        : this.activePageIndex;
      const sheetW = this.sheetWidth || 960;
      const sheetH = this.sheetHeight || 580;
      const anchorX = (this.lastPointerPos && this.lastPointerPos.pageIndex === pageIdx)
        ? this.lastPointerPos.x - dispW / 2
        : (sheetW - dispW) / 2;
      const anchorY = (this.lastPointerPos && this.lastPointerPos.pageIndex === pageIdx)
        ? this.lastPointerPos.y - dispH / 2
        : (sheetH - dispH) / 2;

      const x = Math.round(Math.max(16, Math.min(sheetW - dispW - 16, anchorX)));
      const y = Math.round(Math.max(16, Math.min(sheetH - dispH - 16, anchorY)));

      const cached = new Image();
      cached.src = encodedSrc;
      this.imageCache.set(encodedSrc, cached);

      this.pushUndoSnapshot(pageIdx);
      const item = {
        id: `img_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        kind: 'image',
        src: encodedSrc,
        x,
        y,
        width: dispW,
        height: dispH
      };
      this.commitNewItem(pageIdx, item);
      this.selectedIds = new Set([item.id]);
      this.selectTool('select');
      this.renderAll();
    };
    img.src = rawDataUrl;
  }
}

window.whiteboardManager = new WhiteboardManager();
