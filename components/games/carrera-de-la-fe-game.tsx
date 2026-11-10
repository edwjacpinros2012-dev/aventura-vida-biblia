"use client";

import { useEffect, useRef, useState } from "react";

type RunnerStats = { score: number; faith: number; best: number; running: boolean; message: string };

declare global {
  interface Window { BABYLON?: any }
}

const CDN = "https://cdn.babylonjs.com/babylon.js";

export function CarreraDeLaFeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<{ lane: (value: number) => void; jump: () => void; slide: () => void; restart: () => void } | null>(null);
  const [stats, setStats] = useState<RunnerStats>({ score: 0, faith: 0, best: 0, running: false, message: "Preparado para comenzar" });

  useEffect(() => {
    let disposed = false;
    let engine: any;
    let scene: any;
    let frame = 0;
    let score = 0;
    let faith = 0;
    let speed = 0.24;
    let lane = 0;
    let jumping = 0;
    let sliding = 0;
    let running = false;
    let lastSpawn = 0;
    let lastCoin = 0;
    let obstacles: Array<{ mesh: any; lane: number; kind: string }> = [];
    let coins: Array<{ mesh: any; lane: number }> = [];
    let player: any;
    let playerBaseY = 1;
    let best = 0;
    let onKey: ((event: KeyboardEvent) => void) | undefined;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const load = () => new Promise<void>((resolve, reject) => {
      if (window.BABYLON) return resolve();
      const existing = document.querySelector<HTMLScriptElement>('script[data-babylon-runner="true"]');
      if (existing) { existing.addEventListener("load", () => resolve(), { once: true }); existing.addEventListener("error", () => reject(new Error("No se pudo cargar Babylon.js")), { once: true }); return; }
      const script = document.createElement("script");
      script.src = CDN;
      script.async = true;
      script.dataset.babylonRunner = "true";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("No se pudo cargar Babylon.js"));
      document.head.appendChild(script);
    });

    const start = async () => {
      try {
        await load();
        if (disposed || !window.BABYLON) return;
        const B = window.BABYLON;
        engine = new B.Engine(canvas, true, { preserveDrawingBuffer: false, stencil: true, antialias: true });
        scene = new B.Scene(engine);
        scene.clearColor = new B.Color4(0.035, 0.12, 0.16, 1);
        const camera = new B.FreeCamera("camera", new B.Vector3(0, 5.2, -10), scene);
        camera.setTarget(new B.Vector3(0, 1, 5));
        camera.fov = 0.9;
        const hemi = new B.HemisphericLight("sunlight", new B.Vector3(0, 1, 0), scene);
        hemi.intensity = 0.9;
        const sun = new B.DirectionalLight("sun", new B.Vector3(-0.4, -1, 0.5), scene);
        sun.position = new B.Vector3(4, 9, -5);
        sun.intensity = 0.8;

        const mat = (name: string, color: string, emissive = false) => {
          const m = new B.StandardMaterial(name, scene);
          m.diffuseColor = B.Color3.FromHexString(color);
          if (emissive) m.emissiveColor = B.Color3.FromHexString(color).scale(0.35);
          return m;
        };
        const sand = mat("sand", "#c99b59");
        const road = mat("path", "#795638");
        const gold = mat("gold", "#ffd45e", true);
        const jade = mat("jade", "#24c5a4", true);
        const dark = mat("obstacle", "#754b3c");
        const leaf = mat("leaf", "#2b805e");
        const robe = mat("runner", "#e5bd70");
        const ground = B.MeshBuilder.CreateGround("ground", { width: 30, height: 150 }, scene);
        ground.position.z = 45; ground.material = sand;
        const path = B.MeshBuilder.CreateGround("path", { width: 7.5, height: 150 }, scene);
        path.position.y = 0.015; path.position.z = 45; path.material = road;
        for (let z = -8; z < 120; z += 8) {
          for (const x of [-1.25, 1.25]) {
            const dash = B.MeshBuilder.CreateBox("lane-mark", { width: 0.055, height: 0.025, depth: 2.3 }, scene);
            dash.position.set(x, 0.04, z); dash.material = gold;
          }
        }
        for (let z = -4; z < 115; z += 12) {
          for (const x of [-7, 7]) {
            const trunk = B.MeshBuilder.CreateCylinder("palm-trunk", { height: 2.4, diameter: 0.35 }, scene);
            trunk.position.set(x, 1.1, z + 8); trunk.material = dark;
            const crown = B.MeshBuilder.CreateSphere("palm-crown", { diameter: 2, segments: 6 }, scene);
            crown.position.set(x, 2.5, z + 8); crown.scaling.y = 0.65; crown.material = leaf;
          }
        }
        player = B.MeshBuilder.CreateCapsule ? B.MeshBuilder.CreateCapsule("faith-runner", { height: 1.7, radius: 0.42 }, scene) : B.MeshBuilder.CreateBox("faith-runner", { width: 0.75, height: 1.6, depth: 0.5 }, scene);
        player.position.set(0, playerBaseY, -2); player.material = robe;
        const head = B.MeshBuilder.CreateSphere("head", { diameter: 0.55 }, scene);
        head.parent = player; head.position.y = 0.78; head.material = gold;
        const belt = B.MeshBuilder.CreateBox("belt", { width: 0.78, height: 0.12, depth: 0.54 }, scene);
        belt.parent = player; belt.position.y = -0.15; belt.material = jade;

        const setLane = (next: number) => { lane = Math.max(-1, Math.min(1, next)); };
        const makeObstacle = (kind: string, targetLane: number, z: number) => {
          const mesh = kind === "arch"
            ? B.MeshBuilder.CreateBox("low-arch", { width: 1.65, height: 0.55, depth: 0.65 }, scene)
            : B.MeshBuilder.CreateBox("rock", { width: 1.15, height: 1.15, depth: 0.9 }, scene);
          mesh.position.set(targetLane * 2.15, kind === "arch" ? 1.7 : 0.58, z);
          mesh.material = kind === "arch" ? gold : dark;
          obstacles.push({ mesh, lane: targetLane, kind });
        };
        const makeCoin = (targetLane: number, z: number) => {
          const mesh = B.MeshBuilder.CreateTorus("faith-token", { diameter: 0.62, thickness: 0.16 }, scene);
          mesh.position.set(targetLane * 2.15, 1.2, z); mesh.material = gold;
          coins.push({ mesh, lane: targetLane });
        };
        const reset = () => {
          obstacles.forEach((item) => item.mesh.dispose()); coins.forEach((item) => item.mesh.dispose());
          obstacles = []; coins = []; score = 0; faith = 0; speed = 0.24; lane = 0; jumping = 0; sliding = 0; lastSpawn = 0; lastCoin = 0; running = true;
          player.position.set(0, playerBaseY, -2); player.scaling.y = 1;
          setStats((s) => ({ ...s, score: 0, faith: 0, running: true, message: "¡Corre con fe y reúne destellos!" }));
        };
        const end = () => {
          running = false; best = Math.max(best, score);
          try { localStorage.setItem("av-carrera-fe-best", String(best)); } catch {}
          setStats((s) => ({ ...s, score, faith, best, running: false, message: "¡Sigue adelante! Cada intento te ayuda a crecer." }));
        };
        const jump = () => { if (running && jumping <= 0 && sliding <= 0) jumping = 0.9; };
        const slide = () => { if (running && jumping <= 0) sliding = 0.65; };
        sceneRef.current = { lane: setLane, jump, slide, restart: reset };
        try { best = Number(localStorage.getItem("av-carrera-fe-best") ?? 0) || 0; } catch {}
        setStats((s) => ({ ...s, best }));
        onKey = (event) => {
          if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(event.key)) event.preventDefault();
          if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") setLane(lane - 1);
          if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") setLane(lane + 1);
          if (event.key === "ArrowUp" || event.key === " ") jump();
          if (event.key === "ArrowDown" || event.key.toLowerCase() === "s") slide();
        };
        window.addEventListener("keydown", onKey);
        scene.onBeforeRenderObservable.add(() => {
          const dt = Math.min(engine.getDeltaTime() / 16.67, 2);
          frame += dt;
          if (!running) return;
          score += Math.round(dt * 2);
          speed = Math.min(0.52, speed + dt * 0.00015);
          player.position.x += (lane * 2.15 - player.position.x) * Math.min(1, dt * 0.18);
          if (jumping > 0) { jumping -= dt * 0.018; player.position.y = playerBaseY + Math.sin((0.9 - jumping) / 0.9 * Math.PI) * 1.7; } else player.position.y = playerBaseY;
          if (sliding > 0) { sliding -= dt * 0.018; player.scaling.y = 0.48; } else player.scaling.y = 1;
          lastSpawn += dt; lastCoin += dt;
          if (lastSpawn > 48) { makeObstacle(Math.random() > 0.5 ? "rock" : "arch", Math.floor(Math.random() * 3) - 1, 55); lastSpawn = 0; }
          if (lastCoin > 24) { const coinLane = Math.floor(Math.random() * 3) - 1; for (let i = 0; i < 4; i++) makeCoin(coinLane, 32 + i * 2.2); lastCoin = 0; }
          obstacles = obstacles.filter((item) => {
            item.mesh.position.z -= speed * dt * 2.4;
            if (item.mesh.position.z < -4) { item.mesh.dispose(); return false; }
            const near = Math.abs(item.mesh.position.z + 2) < 0.85 && Math.abs(item.mesh.position.x - player.position.x) < 0.95;
            if (near && (item.kind === "rock" ? player.position.y < 1.75 : sliding <= 0)) { end(); }
            return true;
          });
          coins = coins.filter((item) => {
            item.mesh.position.z -= speed * dt * 2.4; item.mesh.rotation.y += dt * 0.08;
            if (item.mesh.position.z < -4) { item.mesh.dispose(); return false; }
            if (Math.abs(item.mesh.position.z + 2) < 0.9 && Math.abs(item.mesh.position.x - player.position.x) < 1) { faith += 1; item.mesh.dispose(); return false; }
            return true;
          });
          if (Math.floor(frame) % 12 === 0) setStats((s) => s.score === score ? s : ({ ...s, score, faith, best }));
        });
        engine.runRenderLoop(() => { if (!disposed && scene) scene.render(); });
        const resize = () => engine?.resize();
        window.addEventListener("resize", resize);
        (scene as any).__resize = resize;
        setStats((s) => ({ ...s, message: "Pulsa Comenzar para iniciar la carrera" }));
      } catch {
        setStats((s) => ({ ...s, message: "No se pudo iniciar el motor 3D. Comprueba tu conexión e inténtalo de nuevo." }));
      }
    };
    void start();
    return () => {
      disposed = true;
      if (onKey) window.removeEventListener("keydown", onKey);
      if (scene?.__resize) window.removeEventListener("resize", scene.__resize);
      engine?.stopRenderLoop(); scene?.dispose(); engine?.dispose(); sceneRef.current = null;
    };
  }, []);

  return (
    <div className="av-panel overflow-hidden rounded-[1.7rem]">
      <div className="grid grid-cols-3 gap-2 border-b border-white/10 bg-[#061923]/70 p-3 text-center sm:p-4">
        <div><p className="text-[10px] font-black uppercase tracking-wider text-white/50">Distancia</p><p className="font-display text-xl font-black text-[#f5e5b9]">{stats.score} m</p></div>
        <div><p className="text-[10px] font-black uppercase tracking-wider text-white/50">Destellos</p><p className="font-display text-xl font-black text-[#f5bd4d]">{stats.faith} ✦</p></div>
        <div><p className="text-[10px] font-black uppercase tracking-wider text-white/50">Récord</p><p className="font-display text-xl font-black text-[#74e2b0]">{stats.best} m</p></div>
      </div>
      <div className="relative bg-[#0b3441]">
        <canvas ref={canvasRef} className="block h-[430px] w-full touch-none sm:h-[520px]" aria-label="Escenario 3D de La Carrera de la Fe" />
        {!stats.running && <div className="absolute inset-0 flex items-center justify-center bg-[#061923]/65 p-6 text-center backdrop-blur-[2px]"><div className="max-w-sm"><p className="text-5xl">🏃‍♂️ ✨</p><h2 className="mt-3 font-display text-3xl font-black text-[#f5e5b9]">La Carrera de la Fe</h2><p className="mt-2 text-sm leading-6 text-white/75">{stats.message}</p><button type="button" onClick={() => sceneRef.current?.restart()} className="av-gold-button mt-5 rounded-xl px-7 py-3 font-extrabold">{stats.score > 0 ? "Volver a intentarlo" : "Comenzar carrera"}</button></div></div>}
      </div>
      <div className="grid grid-cols-3 gap-2 p-3 sm:p-4">
        <button type="button" onClick={() => sceneRef.current?.lane(-1)} className="av-teal-button rounded-xl py-3 text-sm font-black">← Izquierda</button>
        <button type="button" onClick={() => sceneRef.current?.jump()} className="av-gold-button rounded-xl py-3 text-sm font-black">↑ Saltar</button>
        <button type="button" onClick={() => sceneRef.current?.lane(1)} className="av-teal-button rounded-xl py-3 text-sm font-black">Derecha →</button>
        <button type="button" onClick={() => sceneRef.current?.slide()} className="col-span-3 rounded-xl border border-white/15 bg-white/10 py-3 text-sm font-black text-white hover:bg-white/15">↓ Deslizarse</button>
      </div>
      <p className="px-4 pb-4 text-center text-xs text-white/50">Teclado: ← → cambiar carril · ↑ saltar · ↓ deslizarse. En móvil, usa los botones.</p>
    </div>
  );
}
