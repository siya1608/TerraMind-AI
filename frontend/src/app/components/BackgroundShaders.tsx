'use client';

import React, { useEffect, useRef } from 'react';

export default function BackgroundShaders() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (!gl) return;

    let animationFrameId: number;

    const syncSize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };

    window.addEventListener('resize', syncSize);
    syncSize();

    const vs = `
      attribute vec2 a_position;
      varying vec2 v_texCoord;
      void main() {
        v_texCoord = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fs = `
      precision highp float;
      varying vec2 v_texCoord;
      uniform float u_time;
      
      void main() {
        vec2 uv = v_texCoord;
        float t = u_time * 0.15;
        
        vec3 color1 = vec3(0.01, 0.02, 0.05); // Deep Midnight
        vec3 color2 = vec3(0.03, 0.25, 0.1);  // Emerald Glow
        vec3 color3 = vec3(0.0, 0.12, 0.35);  // Ocean Blue
        vec3 color4 = vec3(0.18, 0.5, 0.12);  // Neon Accent
        
        float n1 = sin(uv.x * 4.0 + t) * cos(uv.y * 3.0 - t * 0.8);
        float n2 = sin(uv.y * 5.0 - t * 1.2) * cos(uv.x * 2.0 + t * 0.5);
        float n3 = sin((uv.x + uv.y) * 3.0 + t);
        
        vec3 finalColor = mix(color1, color2, clamp(n1 * 0.5 + 0.5, 0.0, 1.0));
        finalColor = mix(finalColor, color3, clamp(n2 * 0.4, 0.0, 1.0));
        finalColor = mix(finalColor, color4, clamp(n3 * 0.15, 0.0, 1.0));
        
        float dist = length(uv - 0.5);
        finalColor *= (1.0 - dist * 0.7);
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    const compileShader = (type: number, src: string) => {
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error('Shader compilation error:', gl.getShaderInfoLog(s));
        gl.deleteShader(s);
        return null;
      }
      return s;
    };

    const vertexShader = compileShader(gl.VERTEX_SHADER, vs);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fs);

    if (!vertexShader || !fragmentShader) return;

    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vertexShader);
    gl.attachShader(prog, fragmentShader);
    gl.linkProgram(prog);

    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('Program linking error:', gl.getProgramInfoLog(prog));
      return;
    }

    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const pos = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, 'u_time');

    const render = (t: number) => {
      if (uTime) gl.uniform1f(uTime, t * 0.001);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationFrameId = requestAnimationFrame(render);
    };

    render(0);

    return () => {
      window.removeEventListener('resize', syncSize);
      cancelAnimationFrame(animationFrameId);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full opacity-40 mix-blend-screen pointer-events-none -z-20 bg-background">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}
