import React, { Suspense, useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Environment, Html, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { Box, RotateCw, ZoomIn, AlertCircle } from 'lucide-react';

useGLTF.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.5/');

interface Model3DViewerProps {
  url: string;
  className?: string;
  width?: number;
  height?: number;
  autoRotate?: boolean;
}

function Model({ url }: { url: string }) {
  const gltf = useGLTF(url, true) as any;
  const meshRef = useRef<THREE.Group>(null);

  const scene = useMemo(() => {
    const s = gltf?.scene as THREE.Group | undefined;
    return s ? (s.clone(true) as THREE.Group) : null;
  }, [gltf]);

  // Center the model
  useEffect(() => {
    if (scene) {
      const box = new THREE.Box3().setFromObject(scene);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = maxDim > 0 ? 2 / maxDim : 1;
      scene.position.sub(center);
      scene.scale.setScalar(scale);
    }
  }, [scene]);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <group ref={meshRef}>
      {scene ? <primitive object={scene} /> : null}
    </group>
  );
}

function Loader() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2 bg-black/60 backdrop-blur-sm text-white px-4 py-3 rounded-xl">
        <RotateCw size={20} className="animate-spin" />
        <span className="text-xs font-bold">Loading 3D...</span>
      </div>
    </Html>
  );
}

function ErrorFallback({ message }: { message: string }) {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2 bg-red-900/80 backdrop-blur-sm text-white px-4 py-3 rounded-xl max-w-xs text-center">
        <AlertCircle size={20} />
        <span className="text-xs font-bold">{message}</span>
      </div>
    </Html>
  );
}

function ModelWithFallback({ url }: { url: string }) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
  }, [url]);

  if (error) {
    return <ErrorFallback message={error} />;
  }

  return (
    <Suspense fallback={<Loader />}>
      <Model url={url} />
    </Suspense>
  );
}

export default function Model3DViewer({
  url,
  className = '',
  width = 400,
  height = 400,
  autoRotate = true,
}: Model3DViewerProps) {
  const [isReady, setIsReady] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(5);
  const [contextLost, setContextLost] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0);

  const isLowEndDevice = useMemo(() => {
    try {
      const nav = navigator as Navigator & { deviceMemory?: number; hardwareConcurrency?: number };
      const mem = typeof nav?.deviceMemory === 'number' ? Number(nav.deviceMemory) : undefined;
      const cores = typeof nav?.hardwareConcurrency === 'number' ? Number(nav.hardwareConcurrency) : undefined;
      if (typeof mem === 'number' && mem > 0 && mem <= 4) return true;
      if (typeof cores === 'number' && cores > 0 && cores <= 4) return true;
      return false;
    } catch {
      return false;
    }
  }, []);

  const dpr = isLowEndDevice ? 1 : Math.min(2, typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1);
  const enableEnvironment = !isLowEndDevice;

  const handleContextLost = useCallback((e: Event) => {
    try {
      (e as any)?.preventDefault?.();
    } catch {
    }
    setContextLost(true);
  }, []);

  const handleContextRestored = useCallback(() => {
    setContextLost(false);
    setCanvasKey((k) => k + 1);
  }, []);

  if (!url) return null;

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {/* Controls overlay */}
      <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
        <button
          onClick={() => setZoomLevel((z) => Math.max(1, z - 1))}
          className="w-7 h-7 bg-black/40 backdrop-blur-sm text-white rounded-lg flex items-center justify-center hover:bg-black/60 transition-colors"
          title="Zoom in"
        >
          <ZoomIn size={14} />
        </button>
        <button
          onClick={() => setZoomLevel((z) => Math.min(15, z + 1))}
          className="w-7 h-7 bg-black/40 backdrop-blur-sm text-white rounded-lg flex items-center justify-center hover:bg-black/60 transition-colors"
          title="Zoom out"
        >
          <ZoomIn size={14} className="rotate-180" />
        </button>
      </div>

      {/* 3D badge */}
      <div className="absolute top-2 left-2 z-10 bg-black/40 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1">
        <Box size={10} />
        3D
      </div>

      <Canvas
        key={canvasKey}
        camera={{ position: [0, 0, zoomLevel], fov: 50 }}
        onCreated={({ gl }) => {
          setIsReady(true);
          try {
            const canvas = gl?.domElement as HTMLCanvasElement | undefined;
            if (canvas) {
              canvas.addEventListener('webglcontextlost', handleContextLost as any, { passive: false } as any);
              canvas.addEventListener('webglcontextrestored', handleContextRestored as any);
            }
          } catch {
          }
        }}
        dpr={dpr}
        gl={{ antialias: !isLowEndDevice, toneMapping: THREE.ACESFilmicToneMapping, powerPreference: 'high-performance' }}
        style={{ borderRadius: '1rem' }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <directionalLight position={[-5, -5, -5]} intensity={0.3} />
        <spotLight position={[0, 10, 0]} intensity={0.5} angle={0.5} />

        <ModelWithFallback url={url} />

        <OrbitControls
          autoRotate={autoRotate}
          autoRotateSpeed={1}
          enableZoom={true}
          enablePan={true}
          minDistance={1}
          maxDistance={15}
        />

        {enableEnvironment ? <Environment preset="studio" /> : null}
      </Canvas>

      {/* Poster-like fallback until canvas is ready */}
      {!isReady && !contextLost && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
          <div className="flex flex-col items-center gap-2 text-slate-500">
            <Box size={24} />
            <span className="text-xs font-bold">Preparing 3D...</span>
          </div>
        </div>
      )}

      {/* WebGL context lost fallback */}
      {contextLost && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2 text-white px-4 py-3 rounded-xl max-w-xs text-center">
            <AlertCircle size={20} />
            <span className="text-xs font-bold">WebGL context lost</span>
            <button
              className="mt-1 text-[11px] font-bold bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg"
              onClick={() => {
                setContextLost(false);
                setIsReady(false);
                setCanvasKey((k) => k + 1);
              }}
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Hint */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-[10px] font-bold z-10">
        Drag to rotate • Scroll to zoom
      </div>
    </div>
  );
}
