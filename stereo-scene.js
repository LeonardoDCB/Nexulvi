import * as THREE from 'three';

const canvas = document.querySelector('#stereo-canvas');
const hero = document.querySelector('.hero');
const visual = document.querySelector('.hero-visual');
const status = document.querySelector('#fx-status span');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function report(message, ready = false) {
  if (status) status.textContent = message;
  if (ready) hero.classList.add('webgl-ready');
}

if (canvas && hero && visual) {
  try {
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setScissorTest(true);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(54, 1, .1, 100);
    camera.position.set(0, 0, 7);
    const stereoCamera = new THREE.StereoCamera();
    stereoCamera.eyeSep = .16;
    const group = new THREE.Group();
    scene.add(group);

    const geometry = new THREE.IcosahedronGeometry(.055, 1);
    const palette = [0x8dffe0, 0x9985ff, 0xd8ff70, 0xffffff];
    const nodes = [];
    for (let index = 0; index < 260; index += 1) {
      const material = new THREE.MeshBasicMaterial({ color: palette[index % palette.length], transparent: true, opacity: .55 + Math.random() * .45 });
      const node = new THREE.Mesh(geometry, material);
      node.position.set((Math.random() - .5) * 7.2, (Math.random() - .5) * 7.4, (Math.random() - .5) * 6.2);
      node.scale.setScalar(.5 + Math.random() * 1.8);
      node.userData = { angle: Math.random() * Math.PI * 2, radius: .08 + Math.random() * .24, speed: .0004 + Math.random() * .0012 };
      group.add(node);
      nodes.push(node);
    }

    const rings = new THREE.Group();
    [1.1, 1.45, 1.85, 2.2].forEach((radius, index) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, index === 3 ? .012 : .009, 8, 128), new THREE.MeshBasicMaterial({ color: palette[index % palette.length], transparent: true, opacity: .68 }));
      ring.rotation.set(index * .8, index * .45, index * .35);
      rings.add(ring);
    });
    group.add(rings);

    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(.72, 3), new THREE.MeshBasicMaterial({ color: 0x8dffe0, wireframe: true, transparent: true, opacity: .86 }));
    group.add(core);

    let pointerX = 0;
    let pointerY = 0;
    let targetX = 0;
    let targetY = 0;
    const resize = () => {
      const bounds = visual.getBoundingClientRect();
      const width = Math.max(bounds.width, 1);
      const height = Math.max(bounds.height, 1);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const render = (time = 0) => {
      targetX += (pointerX - targetX) * .055;
      targetY += (pointerY - targetY) * .055;
      camera.position.x += (targetX * 1.8 - camera.position.x) * .035;
      camera.position.y += (-targetY * 1.2 - camera.position.y) * .035;
      camera.lookAt(0, 0, 0);
      group.rotation.y = time * .00008 + targetX * .08;
      group.rotation.x = Math.sin(time * .0002) * .04 + targetY * .04;
      core.rotation.x = time * .0004;
      core.rotation.y = -time * .0005;
      rings.rotation.z = time * .00015;
      nodes.forEach((node) => {
        node.position.x += Math.cos(time * node.userData.speed + node.userData.angle) * node.userData.radius * .002;
        node.position.y += Math.sin(time * node.userData.speed + node.userData.angle) * node.userData.radius * .002;
      });

      const bounds = visual.getBoundingClientRect();
      const width = Math.max(bounds.width, 1);
      const height = Math.max(bounds.height, 1);
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      renderer.setScissorTest(true);
      renderer.setScissor(0, 0, width * pixelRatio / 2, height * pixelRatio);
      renderer.setViewport(0, 0, width * pixelRatio / 2, height * pixelRatio);
      renderer.clearColor();
      stereoCamera.update(camera);
      renderer.render(scene, stereoCamera.cameraL);
      renderer.setScissor(width * pixelRatio / 2, 0, width * pixelRatio / 2, height * pixelRatio);
      renderer.setViewport(width * pixelRatio / 2, 0, width * pixelRatio / 2, height * pixelRatio);
      renderer.render(scene, stereoCamera.cameraR);
      renderer.setScissorTest(false);
      if (!reducedMotion) window.requestAnimationFrame(render);
    };

    visual.addEventListener('pointermove', (event) => {
      const bounds = visual.getBoundingClientRect();
      pointerX = (event.clientX - bounds.left - bounds.width / 2) / bounds.width;
      pointerY = (event.clientY - bounds.top - bounds.height / 2) / bounds.height;
    }, { passive: true });
    window.addEventListener('resize', resize);
    resize();
    report('NEXULVI FX // WEBGL STEREO ACTIVE', true);
    render(performance.now());
  } catch (error) {
    console.warn('Nexulvi WebGL fallback:', error);
    report('NEXULVI FX // WEBGL BLOCKED // CSS FALLBACK');
    hero.classList.remove('webgl-ready');
  }
} else {
  report('NEXULVI FX // CSS FALLBACK');
}
