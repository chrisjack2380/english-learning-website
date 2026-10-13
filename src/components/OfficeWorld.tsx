import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/** Mesh extras carry knowledge IDs. No scene-specific raycaster or downloaded executable code. */
export default function OfficeWorld({
  onSelect,
  seen,
  terms,
}: {
  onSelect: (term: string) => void;
  seen: string[];
  terms: string[];
}) {
  const host = useRef<HTMLDivElement>(null),
    choose = useRef(onSelect),
    action = useRef<(type: string) => void>(() => {});
  choose.current = onSelect;
  const [status, setStatus] = useState('loading'),
    [paused, setPaused] = useState(false),
    [selected, setSelected] = useState('');
  const reduced = useRef(false);
  useEffect(() => {
    const element = host.current!;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl2');
    if (!context) {
      setStatus('fallback');
      return;
    }
    let disposed = false,
      frame = 0,
      mixer: THREE.AnimationMixer | undefined,
      model: THREE.Group | undefined;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#e4ece6');
    const renderer = new THREE.WebGLRenderer({ canvas, context, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor('#e4ece6');
    element.appendChild(canvas);
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 60);
    camera.position.set(9, 7, 10);
    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 1, 0);
    controls.enableDamping = true;
    controls.minDistance = 6;
    controls.maxDistance = 19;
    controls.maxPolarAngle = Math.PI / 2.2;
    scene.add(new THREE.HemisphereLight(0xffffff, 0x77887b, 2.5));
    const light = new THREE.DirectionalLight(0xfff3dc, 3);
    light.position.set(3, 7, 5);
    scene.add(light);
    const resize = () => {
      const { width, height } = element.getBoundingClientRect();
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    resize();
    const clock = new THREE.Clock();
    const ray = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerDown = { x: 0, y: 0 };
    const down = (event: PointerEvent) => {
      pointerDown = { x: event.clientX, y: event.clientY };
    };
    const select = (event: PointerEvent) => {
      if (!model || Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y) > 8)
        return;
      const rect = canvas.getBoundingClientRect();
      pointer.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        (-(event.clientY - rect.top) / rect.height) * 2 + 1,
      );
      ray.setFromCamera(pointer, camera);
      for (const hit of ray.intersectObject(model, true)) {
        let obj: THREE.Object3D | null = hit.object;
        while (obj) {
          if (typeof obj.userData.term === 'string') {
            setSelected(obj.userData.term);
            choose.current(obj.userData.term);
            return;
          }
          obj = obj.parent;
        }
      }
    };
    canvas.addEventListener('pointerdown', down);
    canvas.addEventListener('pointerup', select);
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    reduced.current = motion.matches;
    const motionChange = () => {
      reduced.current = motion.matches;
    };
    motion.addEventListener('change', motionChange);
    action.current = (type) => {
      if (type === 'pause' && mixer) mixer.timeScale = 0;
      if (type === 'play' && mixer) mixer.timeScale = 1;
      if (type === 'reset') {
        camera.position.set(9, 7, 10);
        controls.target.set(0, 1, 0);
      }
      if (type === 'wave' && mixer) {
        mixer.setTime(0);
        mixer.timeScale = 1;
      }
    };
    new GLTFLoader().load(
      `${import.meta.env.BASE_URL}models/office.glb`,
      (gltf) => {
        if (disposed) {
          disposeModel(gltf.scene);
          return;
        }
        model = gltf.scene;
        scene.add(model);
        mixer = new THREE.AnimationMixer(model);
        gltf.animations.forEach((clip) => mixer!.clipAction(clip).play());
        setStatus('ready');
        renderer.render(scene, camera);
        canvas.dataset.meshes = String(gltf.scene.getObjectsByProperty('isMesh', true).length);
        canvas.dataset.animations = String(gltf.animations.length);
      },
      undefined,
      () => {
        if (!disposed) setStatus('fallback');
      },
    );
    const tick = () => {
      if (disposed) return;
      frame = requestAnimationFrame(tick);
      const delta = Math.min(clock.getDelta(), 0.1);
      if (!reduced.current) mixer?.update(delta);
      if (mixer) canvas.dataset.animationTime = String(mixer.time);
      controls.update();
      renderer.render(scene, camera);
    };
    tick();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      motion.removeEventListener('change', motionChange);
      canvas.removeEventListener('pointerdown', down);
      canvas.removeEventListener('pointerup', select);
      controls.dispose();
      mixer?.stopAllAction();
      if (model) disposeModel(model);
      renderer.dispose();
      canvas.remove();
      action.current = () => {};
    };
  }, []);
  return (
    <div className="office-world card">
      <div
        ref={host}
        className="office-canvas"
        aria-label="三维办公室，可拖动视角和点击物体"
        data-state={status}
      />
      <p role="status">
        {status === 'ready'
          ? '三维办公室已加载 · 拖动观察，点击物品发现英语'
          : status === 'loading'
            ? '正在加载办公室模型…'
            : '当前设备或模型加载不支持三维显示；下方物品入口可继续完整学习。'}
      </p>
      <div className="row wrap">
        <button className="text-button" onClick={() => action.current('reset')}>
          重置视角
        </button>
        <button
          className="text-button"
          onClick={() => {
            action.current(paused ? 'play' : 'pause');
            setPaused(!paused);
          }}
        >
          {paused ? '恢复人物动作' : '暂停人物动作'}
        </button>
        <button
          className="text-button"
          onClick={() => {
            action.current('wave');
            choose.current('coworker');
            setSelected('coworker');
            setPaused(false);
          }}
        >
          与同事打招呼
        </button>
      </div>
      <div className="world-word-elements office-word-list" aria-label="办公室物品键盘入口">
        {terms.map((term) => (
          <button
            key={term}
            aria-pressed={selected === term}
            className={seen.includes(term) ? 'discovered' : ''}
            onClick={() => {
              choose.current(term);
              setSelected(term);
            }}
          >
            {seen.includes(term) ? '✓ ' : '+ '}
            {term}
          </button>
        ))}
      </div>
      <p className="small-text muted">
        原创 Blender 模型 · 导出人物关键帧动画 · GLB/Three.js
        实验，非真人视频。物品入口支持键盘与触控。
      </p>
    </div>
  );
}
function disposeModel(model: THREE.Object3D) {
  model.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (mesh.isMesh) {
      mesh.geometry.dispose();
      for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material])
        material.dispose();
    }
  });
}
