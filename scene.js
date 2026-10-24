/* 3D background: glass-metal torus knot, orbit rings, floating shapes and a particle universe.
   Exposes window.Scene.setMode('intro' | 'studio'). Fails gracefully without WebGL. */
(function () {
  'use strict';

  var noop = function () {};
  var api = window.Scene = { setMode: noop };
  var html = document.documentElement;

  if (!window.THREE) { html.classList.add('no-webgl'); return; }

  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var small = matchMedia('(max-width: 860px)').matches || matchMedia('(pointer: coarse)').matches;
  var canvas = document.getElementById('bg');
  var renderer;

  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: !small, alpha: true, powerPreference: 'high-performance' });
  } catch (e) { html.classList.add('no-webgl'); return; }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2));
  renderer.setClearColor(0x000000, 0);

  var scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05060f, 0.017);
  var camera = new THREE.PerspectiveCamera(55, 1, 0.1, 200);
  camera.position.set(0, 0, 10);

  /* lights */
  scene.add(new THREE.AmbientLight(0x6a6aa0, 0.9));
  var l1 = new THREE.PointLight(0x22d3ee, 2.4, 45); l1.position.set(6, 4, 6);
  var l2 = new THREE.PointLight(0xff4fd8, 2.4, 45); l2.position.set(-6, -3, 5);
  var l3 = new THREE.PointLight(0x7c5cff, 2.2, 45); l3.position.set(0, 6, -4);
  scene.add(l1, l2, l3);

  /* hero knot */
  var hero = new THREE.Group();
  scene.add(hero);
  var knotGeo = new THREE.TorusKnotGeometry(1.5, 0.46, small ? 140 : 260, small ? 16 : 30, 2, 3);
  var solid = new THREE.Mesh(knotGeo, new THREE.MeshStandardMaterial({
    color: 0x1b1748, metalness: 0.85, roughness: 0.24, emissive: 0x1a1060, emissiveIntensity: 0.55
  }));
  var wire = new THREE.Mesh(knotGeo, new THREE.MeshBasicMaterial({
    color: 0x8b7bff, wireframe: true, transparent: true, opacity: 0.2
  }));
  wire.scale.setScalar(1.05);
  hero.add(solid, wire);

  /* orbit rings */
  var rings = [];
  [[0x22d3ee, 3.1], [0xff4fd8, 3.7], [0x7c5cff, 4.4]].forEach(function (r, i) {
    var m = new THREE.Mesh(
      new THREE.TorusGeometry(r[1], 0.012, 6, 200),
      new THREE.MeshBasicMaterial({ color: r[0], transparent: true, opacity: 0.55 })
    );
    m.rotation.x = 1.1 + i * 0.45;
    m.rotation.y = i * 0.6;
    hero.add(m);
    rings.push(m);
  });

  /* floating wire shapes */
  var shapes = [];
  var geos = [new THREE.IcosahedronGeometry(0.32, 0), new THREE.OctahedronGeometry(0.3, 0), new THREE.TetrahedronGeometry(0.34, 0)];
  var palette = [0x22d3ee, 0xff4fd8, 0x7c5cff, 0xffd166];
  for (var i = 0; i < (small ? 10 : 18); i++) {
    var s = new THREE.Mesh(geos[i % 3], new THREE.MeshBasicMaterial({
      color: palette[i % 4], wireframe: true, transparent: true, opacity: 0.55
    }));
    s.position.set((Math.random() - 0.5) * 26, (Math.random() - 0.5) * 14, -7 + Math.random() * 10);
    s.userData = { sp: 0.2 + Math.random() * 0.6, base: s.position.y, ph: Math.random() * 6.28 };
    scene.add(s);
    shapes.push(s);
  }

  /* particles */
  var N = small ? 700 : 1800;
  var pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
  var cols = [new THREE.Color(0x22d3ee), new THREE.Color(0xff4fd8), new THREE.Color(0x7c5cff), new THREE.Color(0xffffff)];
  for (var j = 0; j < N; j++) {
    var r = 6 + Math.random() * 38, th = Math.random() * 6.283, ph = Math.acos(2 * Math.random() - 1);
    pos[j * 3] = r * Math.sin(ph) * Math.cos(th);
    pos[j * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * 0.7;
    pos[j * 3 + 2] = r * Math.cos(ph);
    var c = cols[(Math.random() * 4) | 0];
    col[j * 3] = c.r; col[j * 3 + 1] = c.g; col[j * 3 + 2] = c.b;
  }
  var pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  pg.setAttribute('color', new THREE.BufferAttribute(col, 3));
  var points = new THREE.Points(pg, new THREE.PointsMaterial({
    size: small ? 0.07 : 0.055, vertexColors: true, transparent: true, opacity: 0.85,
    blending: THREE.AdditiveBlending, depthWrite: false
  }));
  scene.add(points);

  /* state */
  var modes = { intro: { z: 10, s: 1 }, studio: { z: 17, s: 1.12 } };
  var target = modes.intro, flyZ = null, warp = 0;
  var mx = 0, my = 0, sx = 0, sy = 0;
  var W = 1, H = 1;

  api.setMode = function (m) {
    target = modes[m] || modes.intro;
    if (m === 'studio' && !reduce) {
      flyZ = 2.6; warp = 1;
      setTimeout(function () { flyZ = null; }, 620);
    }
  };

  window.addEventListener('pointermove', function (e) {
    mx = (e.clientX / window.innerWidth) * 2 - 1;
    my = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
  }
  var rt;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(resize, 80); });
  resize();

  var clock = new THREE.Clock(), raf = 0;
  function tick() {
    raf = requestAnimationFrame(tick);
    var t = clock.getElapsedTime();
    var k = reduce ? 0.25 : 1;

    sx += (mx - sx) * 0.05; sy += (my - sy) * 0.05;
    var portrait = W / H < 1;
    var tz = flyZ !== null ? flyZ : target.z * (portrait ? 1.3 : 1);
    camera.position.z += (tz - camera.position.z) * (flyZ !== null ? 0.1 : 0.045);
    camera.position.x += (sx * 1.6 - camera.position.x) * 0.05;
    camera.position.y += (-sy * 1.0 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);

    var sc = target.s * (portrait ? 0.78 : 1);
    hero.scale.x += (sc - hero.scale.x) * 0.05;
    hero.scale.y = hero.scale.z = hero.scale.x;
    hero.rotation.y = t * 0.22 * k + sx * 0.5;
    hero.rotation.x = Math.sin(t * 0.3) * 0.25 * k + sy * 0.3;
    wire.rotation.y = -t * 0.1 * k;

    for (var a = 0; a < rings.length; a++) {
      rings[a].rotation.z = t * (0.15 + a * 0.07) * k;
      rings[a].rotation.x += 0.0015 * k * (a % 2 ? -1 : 1);
    }
    for (var b = 0; b < shapes.length; b++) {
      var s = shapes[b], u = s.userData;
      s.rotation.x += 0.004 * u.sp * k; s.rotation.y += 0.006 * u.sp * k;
      s.position.y = u.base + Math.sin(t * u.sp + u.ph) * 0.6 * k;
    }

    warp *= 0.965;
    points.rotation.y = t * 0.02 * k + warp * 1.5;
    points.rotation.x = sy * 0.06;

    l1.position.x = Math.cos(t * 0.6 * k) * 7;
    l1.position.y = Math.sin(t * 0.5 * k) * 4;
    l2.position.x = Math.cos(t * 0.5 * k + 2) * -7;

    renderer.render(scene, camera);
  }
  tick();

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { cancelAnimationFrame(raf); }
    else { clock.getDelta(); cancelAnimationFrame(raf); tick(); }
  });
})();
