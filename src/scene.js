import * as THREE from 'three';

export function startHeroScene() {
  const canvas = document.getElementById('hero-scene');
  if (!canvas) return;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' });
  } catch { return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.z = 14;
  const geometry = new THREE.BufferGeometry();
  const count = 48;
  const positions = new Float32Array(count * 3);
  for (let index = 0; index < count; index += 1) {
    positions[index * 3] = (Math.random() - 0.5) * 11;
    positions[index * 3 + 1] = (Math.random() - 0.5) * 6;
    positions[index * 3 + 2] = -Math.random() * 3;
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const points = new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0x2455ed, size: 0.025, transparent: true, opacity: 0.27 }));
  scene.add(points);
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(3.7, 0.006, 3, 110),
    new THREE.MeshBasicMaterial({ color: 0x2455ed, transparent: true, opacity: 0.16 }),
  );
  ring.position.set(2.8, 0, -2);
  ring.rotation.x = 0.45;
  scene.add(ring);
  const resize = () => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  resize();
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  let visible = true;
  const visibility = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
  visibility.observe(canvas);
  let frame = 0;
  function render() {
    frame = requestAnimationFrame(render);
    if (!visible || document.hidden || window.matchMedia('(max-width: 760px)').matches) return;
    ring.rotation.z += 0.0007;
    points.rotation.z -= 0.00015;
    renderer.render(scene, camera);
  }
  render();
  window.addEventListener('pagehide', () => {
    cancelAnimationFrame(frame);
    observer.disconnect();
    visibility.disconnect();
    geometry.dispose();
    ring.geometry.dispose();
    renderer.dispose();
  }, { once: true });
}
