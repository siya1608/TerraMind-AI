'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function ThreeGlobe() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [threeLoaded, setThreeLoaded] = useState(false);

  useEffect(() => {
    // Check if THREE is already loaded
    if ((window as any).THREE) {
      setThreeLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.async = true;
    script.onload = () => {
      setThreeLoaded(true);
    };
    document.body.appendChild(script);

    return () => {
      // Don't remove script as it might be needed for other components
    };
  }, []);

  useEffect(() => {
    if (!threeLoaded || !containerRef.current) return;

    const THREE = (window as any).THREE;
    const container = containerRef.current;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 600;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    container.innerHTML = ''; // clear loading message
    container.appendChild(renderer.domElement);

    // Earth Group
    const earthGroup = new THREE.Group();
    earthGroup.rotation.z = (23.5 * Math.PI) / 180;
    scene.add(earthGroup);

    // Earth Sphere
    const geometry = new THREE.SphereGeometry(2.5, 64, 64);
    const material = new THREE.MeshPhongMaterial({
      color: 0x111111,
      emissive: 0x0a2a0a,
      specular: 0x10b981,
      shininess: 30,
      transparent: true,
      opacity: 0.9,
    });
    const earth = new THREE.Mesh(geometry, material);
    earthGroup.add(earth);

    // Digital Grid/Wireframe
    const wireGeometry = new THREE.SphereGeometry(2.51, 48, 48);
    const wireMaterial = new THREE.MeshBasicMaterial({
      color: 0x00d2ff,
      wireframe: true,
      transparent: true,
      opacity: 0.1,
    });
    const wireframe = new THREE.Mesh(wireGeometry, wireMaterial);
    earthGroup.add(wireframe);

    // Glowing Hotspots (Carbon Emissions)
    const hotspotsCount = 100;
    const positions = new Float32Array(hotspotsCount * 3);

    for (let i = 0; i < hotspotsCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / hotspotsCount);
      const theta = Math.sqrt(hotspotsCount * Math.PI) * phi;
      const r = 2.52;

      positions[i * 3] = r * Math.cos(theta) * Math.sin(phi);
      positions[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }

    const hotspotGeometry = new THREE.BufferGeometry();
    hotspotGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const hotspotMaterial = new THREE.PointsMaterial({
      color: 0x10b981,
      size: 0.08,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const hotspots = new THREE.Points(hotspotGeometry, hotspotMaterial);
    earthGroup.add(hotspots);

    // Atmospheric Glow
    const atmosphereGeometry = new THREE.SphereGeometry(2.7, 64, 64);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.BackSide,
      uniforms: {
        glowColor: { value: new THREE.Color(0x00d2ff) },
        viewVector: { value: camera.position },
      },
      vertexShader: `
        varying float intensity;
        void main() {
          vec3 vNormal = normalize( normalMatrix * normal );
          vec3 vNormel = normalize( normalMatrix * vec3(0.0, 0.0, 1.0) );
          intensity = pow( 0.6 - dot(vNormal, vNormel), 2.0 );
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        varying float intensity;
        void main() {
          vec3 glow = glowColor * intensity;
          gl_FragColor = vec4( glow, intensity );
        }
      `,
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphere);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x10b981, 1.5);
    pointLight.position.set(5, 3, 5);
    scene.add(pointLight);

    camera.position.z = 6;

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      earthGroup.rotation.y += 0.0015;
      hotspotMaterial.opacity = 0.5 + Math.sin(Date.now() * 0.002) * 0.3;
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      geometry.dispose();
      material.dispose();
      wireGeometry.dispose();
      wireMaterial.dispose();
      hotspotGeometry.dispose();
      hotspotMaterial.dispose();
      atmosphereGeometry.dispose();
      atmosphereMaterial.dispose();
      renderer.dispose();
    };
  }, [threeLoaded]);

  return (
    <div className="w-full h-full relative flex items-center justify-center">
      <div ref={containerRef} className="w-full h-full min-h-[400px]" style={{ zIndex: 10 }}>
        {!threeLoaded && (
          <div className="w-full h-full flex items-center justify-center text-xs font-mono text-primary/40 animate-pulse">
            LOADING VIRTUAL VITAL SPHERE...
          </div>
        )}
      </div>
    </div>
  );
}
