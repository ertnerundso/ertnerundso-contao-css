/* SZENE: Vorhandene optionale 3D-Hero-Szene; wird nur bei Bedarf geladen.
   Geometrie: config.js. Farbe: base.css. Bewegung: motion.css. */
import * as THREE from 'three';

export function startHeroScene(runtime) {
  const { config, motion } = runtime;
  const settings = config.scene;
  const canvas = document.getElementById('hero-scene');
  if (!canvas) return;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: 'low-power',
    });
  } catch {
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, settings.maxPixelRatio));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    settings.cameraFieldOfView,
    1,
    settings.cameraNear,
    settings.cameraFar,
  );
  camera.position.z = settings.cameraDistance;
  const geometry = new THREE.BufferGeometry();
  const count = settings.pointCount;
  const positions = new Float32Array(count * 3);
  for (let index = 0; index < count; index += 1) {
    positions[index * 3] = (Math.random() - 0.5) * settings.pointRange[0];
    positions[index * 3 + 1] = (Math.random() - 0.5) * settings.pointRange[1];
    positions[index * 3 + 2] = -Math.random() * settings.pointRange[2];
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const primary = motion.value('color-primary');
  const points = new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      color: primary,
      size: motion.number('motion-scene-point-size'),
      transparent: true,
      opacity: motion.number('motion-scene-points-opacity'),
    }),
  );
  scene.add(points);
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(
      settings.ringRadius,
      settings.ringTube,
      ...settings.ringSegments,
    ),
    new THREE.MeshBasicMaterial({
      color: primary,
      transparent: true,
      opacity: motion.number('motion-scene-ring-opacity'),
    }),
  );
  ring.position.set(...settings.ringPosition);
  ring.rotation.x = settings.ringTilt;
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
  const visibility = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
  });
  visibility.observe(canvas);
  let frame = 0;
  let previous = performance.now();
  function render(now) {
    frame = requestAnimationFrame(render);
    const seconds = Math.min((now - previous) / 1000, 1);
    previous = now;
    if (!visible || document.hidden || runtime.smallScreen) return;
    ring.rotation.z += motion.number('motion-scene-ring-speed') * seconds;
    points.rotation.z -= motion.number('motion-scene-points-speed') * seconds;
    renderer.render(scene, camera);
  }
  render(previous);
  let disposed = false;
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    observer.disconnect();
    visibility.disconnect();
    geometry.dispose();
    points.material.dispose();
    ring.geometry.dispose();
    ring.material.dispose();
    renderer.dispose();
  };
  runtime.cleanup(dispose);
  return dispose;
}
