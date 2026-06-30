'use client';

import React, { useRef, useState } from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'emerald' | 'cyan' | 'none';
  tiltEnabled?: boolean;
  onClick?: () => void;
}

export default function GlassCard({
  children,
  className = '',
  glowColor = 'none',
  tiltEnabled = true,
  onClick,
}: GlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transformStyle, setTransformStyle] = useState<string>('perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)');
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tiltEnabled || !cardRef.current) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Scale rotation to max ~10 degrees
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;

    setTransformStyle(
      `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`
    );
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    // Reset tilt with a smooth animation
    setTransformStyle('perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)');
  };

  // Build glow overlay class
  const glowClasses = {
    emerald: 'neon-glow-emerald border-primary/25',
    cyan: 'shadow-[0_0_40px_-10px_rgba(0,210,255,0.4)] border-secondary/25',
    none: 'border-white/10 hover:border-primary/20',
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transform: transformStyle,
        transition: isHovered ? 'transform 0.05s ease-out, border-color 0.5s ease' : 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1), border-color 0.5s ease, box-shadow 0.5s ease',
      }}
      className={`
        glass-card 
        rounded-3xl 
        p-6 
        relative 
        overflow-hidden 
        ${glowClasses[glowColor]} 
        ${onClick ? 'cursor-pointer' : ''} 
        ${className}
      `}
    >
      {/* 1px Inner Border stroke light simulation */}
      <div className="absolute inset-0 pointer-events-none rounded-3xl border border-white/5" />
      
      {/* Liquid Glass Atmospheric Lighting Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" 
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, transparent 100%)',
        }}
      />
      
      {children}
    </div>
  );
}
