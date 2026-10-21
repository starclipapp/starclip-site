/* panovi 体験ビューア
   横長の結合映像を 16:9 に切り出し、ドラッグとピンチで見たいところへ寄るだけの部品。
   外部ライブラリなし。<video> に CSS transform を掛けている。 */
(function () {
  const root = document.getElementById('xp');
  if (!root) return;
  const stage   = root.querySelector('.xp-stage');
  const film    = root.querySelector('.xp-film');
  const video   = root.querySelector('video');
  const hint    = root.querySelector('.xp-hint');
  const note    = root.querySelector('.xp-note');
  const readout = root.querySelector('.xp-zoom');
  const outBtn  = root.querySelector('[data-act="out"]');
  const barPlay = root.querySelector('.xp-bar [data-act="play"]');
  const MAX = 4;

  let AR = 6188 / 1508;       // 読み込めたら実寸で上書き
  let baseW = 0, baseH = 0, minS = 1, s = 1, tx = 0, ty = 0;
  let started = false;

  const stageW = () => stage.clientWidth;
  const stageH = () => stage.clientHeight;

  function layout(keep) {
    const w = stageW(), h = stageH();
    if (!w || !h) return;
    const cx = baseW ? (w / 2 - tx) / (baseW * s) : 0.5;
    const cy = baseH ? (h / 2 - ty) / (baseH * s) : 0.5;
    baseH = h; baseW = h * AR;
    minS = Math.min(1, w / baseW);
    video.style.width = baseW + 'px';
    video.style.height = baseH + 'px';
    s = Math.max(minS, Math.min(MAX, s));
    if (keep) { tx = w / 2 - cx * baseW * s; ty = h / 2 - cy * baseH * s; }
    clamp(); apply();
  }
  function clamp() {
    const w = stageW(), h = stageH(), vw = baseW * s, vh = baseH * s;
    tx = vw <= w ? (w - vw) / 2 : Math.min(0, Math.max(w - vw, tx));
    ty = vh <= h ? (h - vh) / 2 : Math.min(0, Math.max(h - vh, ty));
  }
  function apply() {
    film.style.transform = `translate3d(${tx}px,${ty}px,0) scale(${s})`;
    if (readout) readout.textContent = s.toFixed(1) + '×';
    if (outBtn) outBtn.disabled = s <= minS + 0.001;
  }
  function zoomAt(ns, px, py) {
    ns = Math.max(minS, Math.min(MAX, ns));
    const k = ns / s;
    tx = px - (px - tx) * k; ty = py - (py - ty) * k; s = ns;
    clamp(); apply();
  }
  function frame(where) {
    const w = stageW(), vw = baseW * s;
    tx = where === 'left' ? 0 : where === 'right' ? w - vw : (w - vw) / 2;
    clamp(); apply();
  }
  function hideHint() { hint && hint.classList.add('is-gone'); }

  // 重い動画なので、押されるまで読み込まない
  function begin() {
    if (started) return;
    started = true;
    root.classList.add('is-live');
    if (!video.src && video.dataset.src) video.src = video.dataset.src;
    video.play().catch(() => {});
    setTimeout(hideHint, 6000);
  }
  function toggle() { video.paused ? video.play().catch(() => {}) : video.pause(); }

  video.addEventListener('loadedmetadata', () => {
    if (video.videoWidth) AR = video.videoWidth / video.videoHeight;
    layout(false); frame('center');
  });
  // 横に長すぎて再生できない端末向けの控え
  video.addEventListener('error', () => {
    const alt = video.dataset.fallback;
    if (alt && video.src.indexOf(alt) < 0) {
      video.src = alt;
      if (note) note.textContent = 'この端末では原寸を再生できないため、少し小さい版に切り替えました。';
      video.play().catch(() => {});
    }
  });
  video.addEventListener('play',  () => { if (barPlay) barPlay.textContent = '一時停止'; });
  video.addEventListener('pause', () => { if (barPlay) barPlay.textContent = '再生'; });

  // 指とマウス
  let drag = null;
  stage.addEventListener('pointerdown', (e) => {
    if (!started) { begin(); return; }
    stage.setPointerCapture(e.pointerId);
    drag = { x: e.clientX, y: e.clientY, tx, ty, moved: 0 };
    hideHint();
  });
  stage.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    drag.moved = Math.max(drag.moved, Math.abs(dx) + Math.abs(dy));
    tx = drag.tx + dx; ty = drag.ty + dy; clamp(); apply();
  });
  stage.addEventListener('pointerup', () => {
    if (drag && drag.moved < 6) toggle();
    drag = null;
  });
  stage.addEventListener('pointercancel', () => { drag = null; });
  stage.addEventListener('wheel', (e) => {
    if (!started) return;
    e.preventDefault();
    const r = stage.getBoundingClientRect();
    zoomAt(s * Math.pow(1.0022, -e.deltaY), e.clientX - r.left, e.clientY - r.top);
    hideHint();
  }, { passive: false });
  stage.addEventListener('dblclick', () => { s = minS; clamp(); apply(); });

  // ボタン
  // 大きな開始ボタンは「始める」だけ。下のバーの再生ボタンだけが一時停止も兼ねる
  //（台の上を押した時点で begin() が走っているので、ここで toggle すると即止まる）
  root.querySelectorAll('[data-act="start"]').forEach((b) =>
    b.addEventListener('click', (e) => { e.preventDefault(); begin(); }));
  root.querySelectorAll('.xp-bar [data-act="play"]').forEach((b) =>
    b.addEventListener('click', () => { started ? toggle() : begin(); }));
  root.querySelectorAll('[data-frame]').forEach((b) =>
    b.addEventListener('click', () => { begin(); frame(b.dataset.frame); hideHint(); }));
  root.querySelectorAll('[data-zoom]').forEach((b) =>
    b.addEventListener('click', () => {
      begin();
      zoomAt(s * parseFloat(b.dataset.zoom), stageW() / 2, stageH() / 2);
      hideHint();
    }));

  addEventListener('resize', () => layout(true));
  layout(false);
})();
