/* Mini Code Playground — app logic
   Editors (CodeMirror 5) + sandboxed iframe live preview + ZIP download + URL sharing. */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mobileMQ = matchMedia('(max-width: 860px)');
  var isMobile = function () { return mobileMQ.matches; };

  /* ---------------------------------------------------------------
     Icons
  --------------------------------------------------------------- */
  var ICONS = {
    play: '<polygon points="6 4 20 12 6 20 6 4" fill="currentColor"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.6" y1="13.5" x2="15.4" y2="17.5"/><line x1="15.4" y1="6.5" x2="8.6" y2="10.5"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
    layers: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
    reset: '<polyline points="1 4 1 10 7 10"/><path d="M3.5 15a9 9 0 1 0 2.1-9.4L1 10"/>',
    layout: '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/>',
    zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    terminal: '<polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>',
    external: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>',
    copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',
    monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
    tablet: '<rect x="4" y="2" width="16" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>',
    phone: '<rect x="7" y="2" width="10" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>'
  };
  $$('[data-i]').forEach(function (el) {
    el.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[el.dataset.i] || '') + '</svg>';
  });

  /* ---------------------------------------------------------------
     Starter templates
  --------------------------------------------------------------- */
  var TEMPLATES = [
    {
      id: 'cube', name: 'Neon cube', desc: 'A draggable 3D cube built with pure CSS.',
      html: '<div class="scene">\n  <div class="cube" id="cube">\n    <div class="face front">HTML</div>\n    <div class="face back">CSS</div>\n    <div class="face right">JS</div>\n    <div class="face left">3D</div>\n    <div class="face top">LIVE</div>\n    <div class="face bottom">FUN</div>\n  </div>\n</div>\n<p class="hint">Drag the cube, then edit the code</p>\n',
      css: 'html, body {\n  height: 100%;\n  margin: 0;\n  overflow: hidden;\n  touch-action: none;\n}\n\nbody {\n  display: grid;\n  place-items: center;\n  font-family: system-ui, sans-serif;\n  color: #fff;\n  background: radial-gradient(circle at 50% 40%, #2a1a6e, #07061a 70%);\n}\n\n.scene {\n  width: 160px;\n  height: 160px;\n  perspective: 700px;\n}\n\n.cube {\n  width: 100%;\n  height: 100%;\n  position: relative;\n  transform-style: preserve-3d;\n}\n\n.face {\n  position: absolute;\n  inset: 0;\n  display: grid;\n  place-items: center;\n  font-weight: 800;\n  font-size: 28px;\n  letter-spacing: .05em;\n  border: 2px solid rgba(255, 255, 255, .7);\n  background: linear-gradient(135deg, rgba(124, 92, 255, .55), rgba(34, 211, 238, .35));\n  box-shadow: inset 0 0 40px rgba(255, 255, 255, .25), 0 0 30px rgba(124, 92, 255, .5);\n}\n\n.front  { transform: translateZ(80px); }\n.back   { transform: rotateY(180deg) translateZ(80px); }\n.right  { transform: rotateY(90deg) translateZ(80px); }\n.left   { transform: rotateY(-90deg) translateZ(80px); }\n.top    { transform: rotateX(90deg) translateZ(80px); }\n.bottom { transform: rotateX(-90deg) translateZ(80px); }\n\n.hint {\n  position: fixed;\n  left: 0;\n  right: 0;\n  bottom: 24px;\n  text-align: center;\n  opacity: .6;\n  font-size: 14px;\n}\n',
      js: 'const cube = document.getElementById("cube");\nlet rx = -20, ry = 30, vx = 0, vy = 0.4;\nlet dragging = false, lastX = 0, lastY = 0;\n\nfunction frame() {\n  if (!dragging) {\n    ry += vy;\n    rx += vx;\n    vx *= 0.95;\n    vy += (0.4 - vy) * 0.02;\n  }\n  cube.style.transform = "rotateX(" + rx + "deg) rotateY(" + ry + "deg)";\n  requestAnimationFrame(frame);\n}\n\naddEventListener("pointerdown", (e) => {\n  dragging = true;\n  lastX = e.clientX;\n  lastY = e.clientY;\n});\naddEventListener("pointerup", () => (dragging = false));\naddEventListener("pointermove", (e) => {\n  if (!dragging) return;\n  const dx = e.clientX - lastX;\n  const dy = e.clientY - lastY;\n  ry += dx * 0.5;\n  rx -= dy * 0.5;\n  vy = dx * 0.5;\n  vx = -dy * 0.5;\n  lastX = e.clientX;\n  lastY = e.clientY;\n});\n\nframe();\nconsole.log("Cube ready. Drag it!");\n'
    },
    {
      id: 'particles', name: 'Particle network', desc: 'Canvas particles that react to your pointer.',
      html: '<canvas id="c"></canvas>\n',
      css: 'html, body {\n  margin: 0;\n  height: 100%;\n  overflow: hidden;\n  background: #060616;\n  touch-action: none;\n}\n\ncanvas {\n  display: block;\n}\n',
      js: 'const canvas = document.getElementById("c");\nconst ctx = canvas.getContext("2d");\nconst dpr = Math.min(devicePixelRatio || 1, 2);\nlet w, h;\nconst mouse = { x: -999, y: -999 };\nconst COUNT = 90;\nconst dots = [];\n\nfunction resize() {\n  w = innerWidth;\n  h = innerHeight;\n  canvas.width = w * dpr;\n  canvas.height = h * dpr;\n  canvas.style.width = w + "px";\n  canvas.style.height = h + "px";\n  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);\n}\naddEventListener("resize", resize);\nresize();\n\nfor (let i = 0; i < COUNT; i++) {\n  dots.push({\n    x: Math.random() * w,\n    y: Math.random() * h,\n    vx: (Math.random() - 0.5) * 0.6,\n    vy: (Math.random() - 0.5) * 0.6,\n    r: Math.random() * 2 + 1\n  });\n}\n\naddEventListener("pointermove", (e) => {\n  mouse.x = e.clientX;\n  mouse.y = e.clientY;\n});\n\nfunction loop() {\n  ctx.clearRect(0, 0, w, h);\n  for (const p of dots) {\n    p.x += p.vx;\n    p.y += p.vy;\n    if (p.x < 0 || p.x > w) p.vx *= -1;\n    if (p.y < 0 || p.y > h) p.vy *= -1;\n    const dx = p.x - mouse.x;\n    const dy = p.y - mouse.y;\n    const d = Math.hypot(dx, dy);\n    if (d > 0 && d < 120) {\n      p.x += (dx / d) * 2;\n      p.y += (dy / d) * 2;\n    }\n    ctx.fillStyle = "#22d3ee";\n    ctx.beginPath();\n    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);\n    ctx.fill();\n  }\n  for (let i = 0; i < COUNT; i++) {\n    for (let j = i + 1; j < COUNT; j++) {\n      const a = dots[i], b = dots[j];\n      const d = Math.hypot(a.x - b.x, a.y - b.y);\n      if (d < 110) {\n        ctx.strokeStyle = "rgba(124, 92, 255, " + (1 - d / 110) * 0.7 + ")";\n        ctx.beginPath();\n        ctx.moveTo(a.x, a.y);\n        ctx.lineTo(b.x, b.y);\n        ctx.stroke();\n      }\n    }\n  }\n  requestAnimationFrame(loop);\n}\nloop();\nconsole.log("Particles running: " + COUNT);\n'
    },
    {
      id: 'counter', name: 'Tap counter', desc: 'A chunky 3D button with a pop animation.',
      html: '<main>\n  <p>Total taps</p>\n  <div class="num" id="num">0</div>\n  <button id="btn">Tap me</button>\n</main>\n',
      css: 'body {\n  margin: 0;\n  min-height: 100vh;\n  display: grid;\n  place-items: center;\n  font-family: system-ui, sans-serif;\n  color: #fff;\n  background: linear-gradient(160deg, #0f0c29, #302b63, #24243e);\n}\n\nmain { text-align: center; }\np { margin: 0; opacity: .6; }\n\n.num {\n  font-size: 110px;\n  font-weight: 800;\n  line-height: 1.1;\n  background: linear-gradient(90deg, #22d3ee, #ff4fd8);\n  -webkit-background-clip: text;\n  background-clip: text;\n  color: transparent;\n}\n.num.pop { animation: pop .25s ease; }\n@keyframes pop { 50% { transform: scale(1.25) rotate(-4deg); } }\n\nbutton {\n  margin-top: 20px;\n  padding: 16px 40px;\n  font-size: 20px;\n  font-weight: 700;\n  color: #fff;\n  border: 0;\n  border-radius: 16px;\n  cursor: pointer;\n  background: linear-gradient(135deg, #7c5cff, #22d3ee);\n  box-shadow: 0 6px 0 #3a2aa8, 0 16px 30px rgba(124, 92, 255, .5);\n  transition: transform .1s, box-shadow .1s;\n}\nbutton:active {\n  transform: translateY(5px);\n  box-shadow: 0 1px 0 #3a2aa8, 0 6px 14px rgba(124, 92, 255, .5);\n}\n',
      js: 'const num = document.getElementById("num");\nconst btn = document.getElementById("btn");\nlet count = 0;\n\nbtn.addEventListener("click", () => {\n  count++;\n  num.textContent = count;\n  num.classList.remove("pop");\n  void num.offsetWidth; // restart the animation\n  num.classList.add("pop");\n  if (count % 10 === 0) console.log("Milestone: " + count + " taps");\n});\n'
    },
    {
      id: 'blank', name: 'Blank project', desc: 'Start from an empty page.',
      html: '<h1>Hello, world</h1>\n',
      css: 'body {\n  font-family: system-ui, sans-serif;\n}\n',
      js: 'console.log("Hello from script.js");\n'
    }
  ];

  /* ---------------------------------------------------------------
     State
  --------------------------------------------------------------- */
  var KEY = 'mcp.project.v1';
  var PANES = ['html', 'css', 'js'];
  var editors = {};
  var autoRun = true;
  var renderTimer, saveTimer, toastTimer;
  var errCount = 0;
  var currentTab = 'html';

  var app = $('#app');
  var frame = $('#frame');
  var toastEl = $('#toast');

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2400);
  }

  /* ---------------------------------------------------------------
     Share link encoding (deflate-raw + base64url, with fallback)
  --------------------------------------------------------------- */
  function toB64u(bytes) {
    var s = '';
    for (var i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function fromB64u(str) {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) str += '=';
    var bin = atob(str), out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  async function encodeProject(obj) {
    var bytes = new TextEncoder().encode(JSON.stringify(obj));
    if (typeof CompressionStream !== 'undefined') {
      try {
        var stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate-raw'));
        return 'z' + toB64u(new Uint8Array(await new Response(stream).arrayBuffer()));
      } catch (e) { /* fall through */ }
    }
    return 'p' + toB64u(bytes);
  }
  async function decodeProject(str) {
    var kind = str.charAt(0), bytes = fromB64u(str.slice(1));
    if (kind === 'z') {
      var stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
      bytes = new Uint8Array(await new Response(stream).arrayBuffer());
    }
    return JSON.parse(new TextDecoder().decode(bytes));
  }

  /* ---------------------------------------------------------------
     Editors
  --------------------------------------------------------------- */
  function makeEditor(name, mode, value) {
    var host = $('#ed-' + name);
    if (window.CodeMirror) {
      var cm = CodeMirror(host, {
        value: value, mode: mode, theme: 'pg',
        lineNumbers: true, tabSize: 2, indentUnit: 2, indentWithTabs: false,
        autoCloseBrackets: true, matchBrackets: true, styleActiveLine: true,
        autoCloseTags: name === 'html',
        extraKeys: {
          'Ctrl-Enter': function () { run(true); },
          'Cmd-Enter': function () { run(true); },
          Tab: function (c) { c.somethingSelected() ? c.indentSelection('add') : c.replaceSelection('  ', 'end'); },
          'Shift-Tab': function (c) { c.indentSelection('subtract'); }
        }
      });
      cm.on('change', onEdit);
      var pending = false;
      if (window.ResizeObserver) {
        new ResizeObserver(function () {
          if (pending) return; pending = true;
          requestAnimationFrame(function () { pending = false; cm.refresh(); });
        }).observe(host);
      }
      return {
        get: function () { return cm.getValue(); },
        set: function (v) { cm.setValue(v); },
        refresh: function () { cm.refresh(); }
      };
    }
    // Fallback: plain textarea (used only if the CodeMirror CDN is unreachable)
    var ta = document.createElement('textarea');
    ta.className = 'fallback-ta'; ta.spellcheck = false; ta.value = value;
    ta.addEventListener('input', onEdit);
    ta.addEventListener('keydown', function (e) {
      if (e.key === 'Tab') { e.preventDefault(); document.execCommand('insertText', false, '  '); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') run(true);
    });
    host.appendChild(ta);
    return { get: function () { return ta.value; }, set: function (v) { ta.value = v; }, refresh: function () {} };
  }

  function getCode() { return { html: editors.html.get(), css: editors.css.get(), js: editors.js.get() }; }
  function setCode(c) {
    PANES.forEach(function (p) { editors[p].set(c[p] || ''); });
    scheduleSave();
    run();
  }
  function refreshAll() { PANES.forEach(function (p) { editors[p].refresh(); }); }

  function onEdit() {
    scheduleSave();
    if (!autoRun) return;
    clearTimeout(renderTimer);
    renderTimer = setTimeout(function () { run(); }, 450);
  }
  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      try { localStorage.setItem(KEY, JSON.stringify(getCode())); } catch (e) { /* storage unavailable */ }
    }, 600);
  }

  /* ---------------------------------------------------------------
     Preview
  --------------------------------------------------------------- */
  var HOOK = '(function(){var P=function(t,a){try{parent.postMessage({__pg:1,t:t,a:a},"*")}catch(e){}};' +
    'function f(v){if(typeof v==="string")return v;if(v instanceof Error)return v.stack||v.message;if(typeof v==="function")return String(v);' +
    'try{var s=JSON.stringify(v,function(k,x){return typeof x==="function"?"[function]":x},2);return s===undefined?String(v):s}catch(e){return String(v)}}' +
    '["log","info","warn","error","debug"].forEach(function(m){var o=console[m];console[m]=function(){P(m,[].map.call(arguments,f));try{o&&o.apply(console,arguments)}catch(e){}}});' +
    'addEventListener("error",function(e){P("error",[e.message+(e.lineno?" (line "+e.lineno+")":"")])});' +
    'addEventListener("unhandledrejection",function(e){P("error",["Unhandled promise rejection: "+f(e.reason)])});})();';

  function buildDoc(c) {
    return '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<style>' + c.css.replace(/<\/style/gi, '<\\/style') + '</style></head><body>' + c.html +
      '<script>' + HOOK + '<\/script><script>' + c.js.replace(/<\/script/gi, '<\\/script') + '<\/script></body></html>';
  }

  function run(manual) {
    clearTimeout(renderTimer);
    clearLogs();
    frame.srcdoc = buildDoc(getCode());
    if (manual && isMobile()) setTab('preview');
  }

  /* console */
  var logsEl = $('#logs'), consoleEl = $('#console'), consoleBtn = $('#consoleBtn'), badge = $('#errBadge');
  function clearLogs() {
    errCount = 0; badge.hidden = true;
    logsEl.innerHTML = '<div class="empty">console.log() output from your script shows up here.</div>';
  }
  function addLog(type, args) {
    var empty = $('.empty', logsEl); if (empty) empty.remove();
    var d = document.createElement('div');
    d.className = 'log ' + (type === 'debug' ? 'info' : type);
    d.textContent = args.join(' ');
    logsEl.appendChild(d);
    while (logsEl.children.length > 300) logsEl.removeChild(logsEl.firstChild);
    logsEl.scrollTop = logsEl.scrollHeight;
    if (type === 'error') { errCount++; badge.textContent = errCount > 9 ? '9+' : errCount; badge.hidden = false; }
  }
  window.addEventListener('message', function (e) {
    if (e.source !== frame.contentWindow || !e.data || !e.data.__pg) return;
    addLog(e.data.t, e.data.a || []);
  });
  consoleBtn.addEventListener('click', function () {
    var open = consoleEl.classList.toggle('open');
    consoleBtn.setAttribute('aria-pressed', open);
  });
  $('#clearLog').addEventListener('click', clearLogs);

  /* devices */
  $$('[data-device]').forEach(function (b) {
    b.addEventListener('click', function () {
      $('#frameWrap').dataset.device = b.dataset.device;
      $$('[data-device]').forEach(function (x) { x.classList.toggle('on', x === b); });
    });
  });

  $('#openBtn').addEventListener('click', function () {
    var url = URL.createObjectURL(new Blob([buildDoc(getCode())], { type: 'text/html' }));
    window.open(url, '_blank');
    setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
  });

  /* ---------------------------------------------------------------
     Toolbar actions
  --------------------------------------------------------------- */
  $('#runBtn').addEventListener('click', function () { run(true); });

  var autoBtn = $('#autoBtn');
  autoBtn.addEventListener('click', function () {
    autoRun = !autoRun;
    autoBtn.classList.toggle('on', autoRun);
    autoBtn.setAttribute('aria-pressed', autoRun);
    toast(autoRun ? 'Auto-run on: preview updates as you type' : 'Auto-run off: press Run to update the preview');
  });

  var workspace = $('#workspace');
  $('#layoutBtn').addEventListener('click', function () {
    var bottom = workspace.classList.toggle('bottom');
    workspace.style.removeProperty('--split'); workspace.style.removeProperty('--splitv');
    toast(bottom ? 'Preview moved below the editors' : 'Preview moved beside the editors');
    setTimeout(refreshAll, 60);
  });

  $('#resetBtn').addEventListener('click', function () {
    if (!confirm('Reset to the starter project? Your current code will be replaced.')) return;
    var t = TEMPLATES[0];
    setCode({ html: t.html, css: t.css, js: t.js });
    history.replaceState(null, '', location.pathname + location.search);
    toast('Project reset');
  });

  $('#shareBtn').addEventListener('click', async function () {
    try {
      var payload = await encodeProject(getCode());
      var url = location.origin + location.pathname + '#c=' + payload;
      history.replaceState(null, '', '#c=' + payload);
      var copied = await copyText(url);
      if (url.length > 8000) toast('Link copied, but it is long. Some apps may cut it off.');
      else toast(copied ? 'Share link copied to clipboard' : 'Link is in the address bar. Copy it from there.');
    } catch (e) { toast('Could not create the link'); }
  });

  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; } catch (e) { /* fallback */ }
    try {
      var ta = document.createElement('textarea');
      ta.value = text; ta.style.cssText = 'position:fixed;opacity:0;top:0';
      document.body.appendChild(ta); ta.select();
      var ok = document.execCommand('copy'); ta.remove(); return ok;
    } catch (e) { return false; }
  }

  $$('[data-copy]').forEach(function (b) {
    b.addEventListener('click', async function () {
      var ok = await copyText(editors[b.dataset.copy].get());
      toast(ok ? b.dataset.copy.toUpperCase() + ' copied' : 'Copy failed');
    });
  });
  $$('[data-clear]').forEach(function (b) {
    b.addEventListener('click', function () {
      editors[b.dataset.clear].set('');
      toast(b.dataset.clear.toUpperCase() + ' cleared');
    });
  });

  /* ZIP download */
  function buildExport(c) {
    var html = c.html;
    var link = '<link rel="stylesheet" href="style.css">';
    var scr = '<script src="script.js"><\/script>';
    var full;
    if (/<html[\s>]/i.test(html) || /<!doctype/i.test(html)) {
      full = /<\/head>/i.test(html) ? html.replace(/<\/head>/i, '  ' + link + '\n</head>') : html.replace(/<html[^>]*>/i, '$&<head>' + link + '</head>');
      full = /<\/body>/i.test(full) ? full.replace(/<\/body>/i, '  ' + scr + '\n</body>') : full + '\n' + scr;
    } else {
      full = '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>My Playground Project</title>\n  ' + link + '\n</head>\n<body>\n' + html + '\n  ' + scr + '\n</body>\n</html>\n';
    }
    return [
      { name: 'index.html', text: full },
      { name: 'style.css', text: c.css },
      { name: 'script.js', text: c.js },
      { name: 'README.txt', text: 'Exported from Mini Code Playground.\nOpen index.html in a browser, or drop this folder onto any static host (Vercel, Netlify, GitHub Pages).\n' }
    ];
  }
  $('#dlBtn').addEventListener('click', function () {
    var blob = MiniZip.createZip(buildExport(getCode()));
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'playground-project.zip';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 5000);
    toast('Downloaded playground-project.zip');
  });

  /* templates menu */
  var tplMenu = $('#tplMenu'), tplBtn = $('#tplBtn');
  TEMPLATES.forEach(function (t) {
    var b = document.createElement('button');
    b.type = 'button';
    b.innerHTML = '<strong></strong><span></span>';
    b.firstChild.textContent = t.name; b.lastChild.textContent = t.desc;
    b.addEventListener('click', function () {
      closeMenu(); loadTemplate(t); toast('Loaded “' + t.name + '”');
    });
    tplMenu.appendChild(b);
  });
  function loadTemplate(t) { setCode({ html: t.html, css: t.css, js: t.js }); if (isMobile()) setTab('preview'); }
  function closeMenu() { tplMenu.hidden = true; tplBtn.setAttribute('aria-expanded', 'false'); }
  tplBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    tplMenu.hidden = !tplMenu.hidden;
    tplBtn.setAttribute('aria-expanded', String(!tplMenu.hidden));
  });
  document.addEventListener('click', function (e) { if (!tplMenu.contains(e.target)) closeMenu(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  /* ---------------------------------------------------------------
     Mobile tabs
  --------------------------------------------------------------- */
  var TAB_ORDER = ['html', 'css', 'js', 'preview'];
  var mnav = $('#mnav');
  function setTab(name) {
    currentTab = name;
    $$('.panel').forEach(function (p) { p.classList.toggle('active', p.dataset.pane === name); });
    $$('button', mnav).forEach(function (b) { b.classList.toggle('on', b.dataset.tab === name); });
    mnav.style.setProperty('--i', TAB_ORDER.indexOf(name));
    setTimeout(refreshAll, 30);
  }
  $$('button', mnav).forEach(function (b) { b.addEventListener('click', function () { setTab(b.dataset.tab); }); });
  mobileMQ.addEventListener && mobileMQ.addEventListener('change', function () { setTab(currentTab); setTimeout(refreshAll, 60); });

  /* ---------------------------------------------------------------
     Resizable split
  --------------------------------------------------------------- */
  var gutter = $('#gutter');
  gutter.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    gutter.setPointerCapture(e.pointerId);
    document.body.classList.add('dragging');
    var bottom = workspace.classList.contains('bottom');
    var move = function (ev) {
      var r = workspace.getBoundingClientRect();
      var pct = bottom ? ((ev.clientY - r.top) / r.height) * 100 : ((ev.clientX - r.left) / r.width) * 100;
      pct = Math.max(20, Math.min(80, pct));
      workspace.style.setProperty(bottom ? '--splitv' : '--split', pct + '%');
    };
    var up = function () {
      document.body.classList.remove('dragging');
      gutter.removeEventListener('pointermove', move);
      gutter.removeEventListener('pointerup', up);
      gutter.removeEventListener('pointercancel', up);
      refreshAll();
    };
    gutter.addEventListener('pointermove', move);
    gutter.addEventListener('pointerup', up);
    gutter.addEventListener('pointercancel', up);
  });
  gutter.addEventListener('keydown', function (e) {
    var bottom = workspace.classList.contains('bottom');
    var prop = bottom ? '--splitv' : '--split';
    var cur = parseFloat(getComputedStyle(workspace).getPropertyValue(prop)) || 46;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') cur -= 3;
    else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') cur += 3;
    else return;
    workspace.style.setProperty(prop, Math.max(20, Math.min(80, cur)) + '%');
  });

  /* ---------------------------------------------------------------
     3D tilt + glare on panels (mouse devices only)
  --------------------------------------------------------------- */
  if (matchMedia('(hover: hover) and (pointer: fine)').matches && !reduce) {
    $$('.panel').forEach(function (p) {
      p.addEventListener('pointermove', function (e) {
        if (isMobile()) return;
        var r = p.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        p.style.setProperty('--gx', (x * 100) + '%');
        p.style.setProperty('--gy', (y * 100) + '%');
        if (p.matches(':focus-within') || document.body.classList.contains('dragging')) { p.style.transform = ''; return; }
        p.style.transform = 'perspective(1400px) rotateX(' + ((0.5 - y) * 3.2).toFixed(2) + 'deg) rotateY(' + ((x - 0.5) * 4.2).toFixed(2) + 'deg)';
      });
      p.addEventListener('pointerleave', function () { p.style.transform = ''; });
    });
  }

  /* ---------------------------------------------------------------
     Intro / studio switching
  --------------------------------------------------------------- */
  var hero = $('#hero'), studio = $('#studio');
  function enterStudio(instant) {
    app.classList.remove('state-intro'); app.classList.add('state-studio');
    document.documentElement.classList.add('studio');
    hero.inert = true; studio.inert = false;
    if (window.Scene) window.Scene.setMode('studio');
    setTimeout(refreshAll, instant ? 0 : 500);
    setTimeout(refreshAll, instant ? 100 : 1300);
  }
  function exitStudio() {
    app.classList.remove('state-studio'); app.classList.add('state-intro');
    document.documentElement.classList.remove('studio');
    hero.inert = false; studio.inert = true;
    if (window.Scene) window.Scene.setMode('intro');
  }
  $('#enter').addEventListener('click', function () { enterStudio(); });
  $('#enterTpl').addEventListener('click', function () { enterStudio(); toast('Edit any panel and the preview updates live'); });
  $('#home').addEventListener('click', exitStudio);

  /* hero parallax */
  if (!reduce) {
    window.addEventListener('pointermove', function (e) {
      if (!app.classList.contains('state-intro')) return;
      hero.style.setProperty('--mx', ((e.clientX / window.innerWidth) * 2 - 1).toFixed(3));
      hero.style.setProperty('--my', ((e.clientY / window.innerHeight) * 2 - 1).toFixed(3));
    }, { passive: true });
  }

  /* keyboard: Ctrl/Cmd+S just saves */
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      try { localStorage.setItem(KEY, JSON.stringify(getCode())); } catch (err) { /* ignore */ }
      toast('Saved in this browser');
    }
  });

  /* ---------------------------------------------------------------
     Boot
  --------------------------------------------------------------- */
  async function boot() {
    var start = TEMPLATES[0], fromLink = false, code = null;

    var m = location.hash.match(/^#c=(.+)$/);
    if (m) {
      try { code = await decodeProject(m[1]); fromLink = true; } catch (e) { code = null; }
    }
    if (!code) {
      try { var saved = JSON.parse(localStorage.getItem(KEY) || 'null'); if (saved && typeof saved.html === 'string') code = saved; } catch (e) { /* ignore */ }
    }
    if (!code) code = { html: start.html, css: start.css, js: start.js };

    editors.html = makeEditor('html', 'htmlmixed', code.html || '');
    editors.css = makeEditor('css', 'css', code.css || '');
    editors.js = makeEditor('js', 'javascript', code.js || '');

    setTab('html');
    run();
    hero.inert = false;

    if (fromLink) {
      enterStudio(true);
      setTimeout(function () { toast('Loaded a shared project'); }, 900);
    }
  }
  boot();
})();
