import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Skill } from '../types';

interface Props {
  skills: Skill[];
  color: string;
  title: string;
}

export const RadarChart: React.FC<Props> = ({ skills, color, title }) => {
  const size = 320;
  const center = size / 2;
  const radius = 100; // ラベルのスペースを確保するために少し小さく調整
  const levels = 5;

  const [progress, setProgress] = useState(1);
  const [prevColor, setPrevColor] = useState(color);
  
  const lastState = useRef<{ skills: Skill[]; color: string }>({ skills, color });
  const requestRef = useRef<number>(null);
  const startTimeRef = useRef<number>(null);

  const getRadiusAtAngle = (targetSkills: Skill[], angle: number) => {
    const count = targetSkills.length;
    if (count === 0) return 0;
    const angleStep = (Math.PI * 2) / count;
    const normalizedAngle = (angle + Math.PI / 2 + Math.PI * 10) % (Math.PI * 2);
    
    const index1 = Math.floor(normalizedAngle / angleStep) % count;
    const index2 = (index1 + 1) % count;
    const fraction = (normalizedAngle % angleStep) / angleStep;
    
    const r1 = (radius / levels) * (targetSkills[index1]?.level || 0);
    const r2 = (radius / levels) * (targetSkills[index2]?.level || 0);
    
    return r1 + (r2 - r1) * fraction;
  };

  const currentPoints = useMemo(() => {
    const count = skills.length;
    if (count === 0) return [];
    const angleStep = (Math.PI * 2) / count;

    return skills.map((s, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const targetR = (radius / levels) * s.level;
      const startR = getRadiusAtAngle(lastState.current.skills, angle);
      const currentR = startR + (targetR - startR) * progress;

      return {
        x: center + currentR * Math.cos(angle),
        y: center + currentR * Math.sin(angle)
      };
    });
  }, [skills, progress]);

  const activeColor = useMemo(() => {
    const parse = (c: string) => {
      if (c.startsWith('rgb')) return c.match(/\d+/g)?.map(Number) || [0,0,0];
      const hex = parseInt(c.replace('#', ''), 16);
      return [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255];
    };
    const c1 = parse(prevColor);
    const c2 = parse(color);
    const r = Math.round(c1[0] + (c2[0] - c1[0]) * progress);
    const g = Math.round(c1[1] + (c2[1] - c1[1]) * progress);
    const b = Math.round(c1[2] + (c2[2] - c1[2]) * progress);
    return `rgb(${r}, ${g}, ${b})`;
  }, [color, progress, prevColor]);

  const animate = (time: number) => {
    if (startTimeRef.current === null) startTimeRef.current = time;
    const elapsed = time - startTimeRef.current;
    const duration = 900;
    const p = Math.min(elapsed / duration, 1);
    
    const ease = 1 - Math.pow(1 - p, 3); 
    setProgress(ease);

    if (p < 1) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      lastState.current = { skills, color };
      setPrevColor(color);
    }
  };

  useEffect(() => {
    setProgress(0);
    startTimeRef.current = null;
    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [skills, color]);

  const pointsString = currentPoints.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className="relative w-full max-w-[320px] aspect-square flex items-center justify-center mx-auto">
      {/* 背景のグロー演出 */}
      <div 
        className="absolute w-1/2 h-1/2 rounded-full blur-[60px] md:blur-[80px] opacity-10 transition-colors duration-1000"
        style={{ backgroundColor: color }}
      ></div>

      <svg 
        viewBox={`0 0 ${size} ${size}`} 
        className="relative z-10 w-full h-full overflow-visible"
      >
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 背景グリッド */}
        <g className="transition-opacity duration-700" style={{ opacity: progress }}>
          {Array.from({ length: levels }).map((_, levelIdx) => {
            const l = levelIdx + 1;
            const gridPoints = Array.from({ length: skills.length }).map((_, j) => {
              const r = (radius / levels) * l;
              const angle = j * ((Math.PI * 2) / skills.length) - Math.PI / 2;
              return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
            }).join(' ');
            return <polygon key={levelIdx} points={gridPoints} fill="none" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="2,2" />;
          })}
        </g>

        {/* メインポリゴン */}
        <polygon
          points={pointsString}
          fill={activeColor}
          fillOpacity="0.15"
          stroke={activeColor}
          strokeWidth="3"
          strokeLinejoin="round"
          filter="url(#glow)"
        />

        {/* 頂点ドット */}
        {currentPoints.map((p, i) => (
          <g key={i}>
            {/* Fix: removed invalid md:r attribute which is not supported in React SVGProps */}
            <circle cx={p.x} cy={p.y} r="5" fill={activeColor} className="stroke-white stroke-2" />
            <circle cx={p.x} cy={p.y} r="12" fill={activeColor} fillOpacity="0.1" />
          </g>
        ))}

        {/* 項目ラベル */}
        {skills.map((s, i) => {
          const r = radius + 32;
          const angle = i * ((Math.PI * 2) / skills.length) - Math.PI / 2;
          const x = center + r * Math.cos(angle);
          const y = center + r * Math.sin(angle);
          
          return (
            <text
              key={s.id}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[9px] md:text-[10px] font-black tracking-tighter transition-all duration-700 uppercase"
              style={{ 
                fill: progress > 0.5 ? '#4a5568' : 'transparent',
                opacity: progress 
              }}
            >
              {s.name}
            </text>
          );
        })}
      </svg>
    </div>
  );
};
