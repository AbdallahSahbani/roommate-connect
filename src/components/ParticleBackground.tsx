import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticleFieldProps {
  count?: number;
  color?: string;
  size?: number;
}

function Particles({ count = 500, color = '#00ffff', size = 0.015 }: ParticleFieldProps) {
  const mesh = useRef<THREE.Points>(null);
  const light = useRef<THREE.PointLight>(null);
  
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 10;
      positions[i3 + 1] = (Math.random() - 0.5) * 10;
      positions[i3 + 2] = (Math.random() - 0.5) * 10;
      
      velocities[i3] = (Math.random() - 0.5) * 0.002;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.002;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.002;
    }
    
    return { positions, velocities };
  }, [count]);

  useFrame((state) => {
    if (!mesh.current) return;
    
    const positions = mesh.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      positions[i3] += particles.velocities[i3];
      positions[i3 + 1] += particles.velocities[i3 + 1];
      positions[i3 + 2] += particles.velocities[i3 + 2];
      
      // Wrap around
      if (positions[i3] > 5) positions[i3] = -5;
      if (positions[i3] < -5) positions[i3] = 5;
      if (positions[i3 + 1] > 5) positions[i3 + 1] = -5;
      if (positions[i3 + 1] < -5) positions[i3 + 1] = 5;
      if (positions[i3 + 2] > 5) positions[i3 + 2] = -5;
      if (positions[i3 + 2] < -5) positions[i3 + 2] = 5;
    }
    
    mesh.current.geometry.attributes.position.needsUpdate = true;
    mesh.current.rotation.y = state.clock.elapsedTime * 0.02;
    mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.1;
    
    if (light.current) {
      light.current.position.x = Math.sin(state.clock.elapsedTime * 0.5) * 3;
      light.current.position.z = Math.cos(state.clock.elapsedTime * 0.5) * 3;
    }
  });

  return (
    <>
      <pointLight ref={light} distance={50} intensity={2} color={color} />
      <points ref={mesh}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={count}
            array={particles.positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={size}
          color={color}
          transparent
          opacity={0.8}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
    </>
  );
}

function NeuralConnections() {
  const linesRef = useRef<THREE.LineSegments>(null);
  const pointsRef = useRef<THREE.Points>(null);
  
  const { nodes, connections } = useMemo(() => {
    const nodeCount = 30;
    const nodes: THREE.Vector3[] = [];
    const connections: number[] = [];
    
    // Create nodes in a brain-like shape
    for (let i = 0; i < nodeCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.5 + Math.random() * 0.5;
      
      nodes.push(new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta) * 0.8,
        r * Math.cos(phi)
      ));
    }
    
    // Create connections between nearby nodes
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        if (nodes[i].distanceTo(nodes[j]) < 1.2) {
          connections.push(
            nodes[i].x, nodes[i].y, nodes[i].z,
            nodes[j].x, nodes[j].y, nodes[j].z
          );
        }
      }
    }
    
    return { nodes, connections: new Float32Array(connections) };
  }, []);

  useFrame((state) => {
    if (linesRef.current) {
      linesRef.current.rotation.y = state.clock.elapsedTime * 0.1;
      linesRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.2;
    }
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.1;
      pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.2;
    }
  });

  const nodePositions = useMemo(() => {
    const arr = new Float32Array(nodes.length * 3);
    nodes.forEach((node, i) => {
      arr[i * 3] = node.x;
      arr[i * 3 + 1] = node.y;
      arr[i * 3 + 2] = node.z;
    });
    return arr;
  }, [nodes]);

  return (
    <group position={[2, 0, -2]}>
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={connections.length / 3}
            array={connections}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#00ffff" transparent opacity={0.15} />
      </lineSegments>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={nodes.length}
            array={nodePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          color="#00ffff"
          transparent
          opacity={0.8}
          sizeAttenuation
        />
      </points>
    </group>
  );
}

function GlowingSphere() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.05);
    }
  });

  return (
    <mesh ref={meshRef} position={[-3, 1, -4]}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshBasicMaterial color="#7c3aed" transparent opacity={0.3} />
    </mesh>
  );
}

export function ParticleBackground() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.2} />
        <Particles count={400} color="#00ffff" size={0.012} />
        <Particles count={200} color="#7c3aed" size={0.01} />
        <Particles count={100} color="#f59e0b" size={0.008} />
        <NeuralConnections />
        <GlowingSphere />
      </Canvas>
      
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/30 via-transparent to-background/30 pointer-events-none" />
    </div>
  );
}
