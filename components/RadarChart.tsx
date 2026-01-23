import React from 'react';
import { Skill } from '../types';

interface Props {
  skills: Skill[];
  color: string;
  title: string;
}

export const RadarChart: React.FC<Props> = ({ skills, color, title }) => {
  const size = 300; // Increased size from 200 to 300
  const center = size / 2;
  const radius = 100; // Increased radius from 70 to 100
  const levels = 5;

  // Minimum 3 points to make a polygon, default to 6 for balanced look if possible
  const pointsCount = Math.max(skills.length, 3);
  const angleStep = (Math.PI * 2) / pointsCount;

  // Calculate coordinates for grid and data
  const getCoordinates = (index: number, level: number) => {
    const r = (radius / levels) * level;
    const angle = index * angleStep - Math.PI / 2;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const gridLines = [];
  for (let l = 1; l <= levels; l++) {
    const points = [];
    for (let i = 0; i < pointsCount; i++) {
      const { x, y } = getCoordinates(i, l);
      points.push(`${x},${y}`);
    }
    gridLines.push(points.join(' '));
  }

  const dataPoints = skills.map((s, i) => {
    const { x, y } = getCoordinates(i, s.level);
    return `${x},${y}`;
  }).join(' ');

  const labels = skills.map((s, i) => {
    // Offset labels slightly more for the larger chart
    const { x, y } = getCoordinates(i, levels + 1.5);
    return (
      <text
        key={i}
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="middle"
        className="text-[11px] fill-earth-700 font-bold"
      >
        {s.name}
      </text>
    );
  });

  return (
    <div className="flex flex-col items-center">
      <div className="mb-6 flex items-center gap-2">
        <div className="w-10 h-1 rounded-full opacity-60" style={{ backgroundColor: color }}></div>
        <span className="text-xs font-black text-earth-400 uppercase tracking-[0.2em]">{title}</span>
      </div>
      <svg width={size} height={size} className="overflow-visible">
        {/* Grid lines */}
        {gridLines.map((points, i) => (
          <polygon
            key={i}
            points={points}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        ))}
        {/* Axis lines */}
        {Array.from({ length: pointsCount }).map((_, i) => {
          const { x, y } = getCoordinates(i, levels);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          );
        })}
        {/* Data area */}
        {skills.length > 0 && (
          <polygon
            points={dataPoints}
            fill={color}
            fillOpacity="0.25"
            stroke={color}
            strokeWidth="3"
            className="drop-shadow-sm"
          />
        )}
        {/* Data points */}
        {skills.map((s, i) => {
          const { x, y } = getCoordinates(i, s.level);
          return <circle key={i} cx={x} cy={y} r="4" fill={color} className="stroke-white stroke-2" />;
        })}
        {/* Labels */}
        {labels}
        {/* Scale numbers */}
        {[1, 2, 3, 4, 5].map(l => {
             const {y} = getCoordinates(0, l);
             return <text key={l} x={center} y={y} textAnchor="middle" className="text-[9px] fill-gray-300 font-mono" dy="-4">{l}</text>
        })}
      </svg>
    </div>
  );
};