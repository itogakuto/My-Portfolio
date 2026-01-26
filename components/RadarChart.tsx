import React, { useState, useEffect, useRef } from 'react';
import { Skill } from '../types';

interface Props {
  skills: Skill[];
  color: string;
  title: string;
}

export const RadarChart: React.FC<Props> = ({ skills, color, title }) => {
  // アニメーションの進捗状態 (0 to 1)
  const [progress, setProgress] = useState(0);
  const requestRef = useRef<number>(null);
  const startTimeRef = useRef<number>(null);

  const size = 300;
  const center = size / 2;
  const radius = 100;
  const levels = 5;

  // イージング関数: Quintic Out (スッと速く始まり、ゆっくり止まる)
  const easeOutQuint = (x: number): number => {
    return 1 - Math.pow(1 - x, 5);
  };

  // アニメーションループ
  const animate = (time: number) => {
    if (startTimeRef.current === null) {
      startTimeRef.current = time;
    }
    const elapsedTime = time - startTimeRef.current;
    const duration = 1000; // 1秒かけて展開
    const nextProgress = Math.min(elapsedTime / duration, 1);

    setProgress(easeOutQuint(nextProgress));

    if (nextProgress < 1) {
      requestRef.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    // データが変わるたびにアニメーションをリセット
    setProgress(0);
    startTimeRef.current = null;
    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [skills, title]);

  const pointsCount = Math.max(skills.length, 3);
  const angleStep = (Math.PI * 2) / pointsCount;

  // 座標取得 (progressを考慮)
  const getCoordinates = (index: number, level: number, currentProgress: number) => {
    // レベルに進捗率を掛けることで、面積全体を伸縮させる
    const r = (radius / levels) * level * currentProgress;
    const angle = index * angleStep - Math.PI / 2;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // 背景のグリッド（固定）
  const gridLines = [];
  for (let l = 1; l <= levels; l++) {
    const points = [];
    for (let i = 0; i < pointsCount; i++) {
      // グリッドは常にprogress=1で描画
      const r = (radius / levels) * l;
      const angle = i * angleStep - Math.PI / 2;
      points.push(`${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`);
    }
    gridLines.push(points.join(' '));
  }

  // データエリアのポイント文字列生成
  const dataPoints = skills.map((s, i) => {
    const { x, y } = getCoordinates(i, s.level, progress);
    return `${x},${y}`;
  }).join(' ');

  const labels = skills.map((s, i) => {
    // ラベルの位置は固定
    const r = radius + 35;
    const angle = i * angleStep - Math.PI / 2;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return (
      <text
        key={`${s.id}-${i}`}
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
        <div 
          className="w-10 h-1 rounded-full opacity-60 transition-colors duration-500" 
          style={{ backgroundColor: color }}
        ></div>
        <span className="text-xs font-black text-earth-400 uppercase tracking-[0.2em]">{title}</span>
      </div>
      <svg width={size} height={size} className="overflow-visible">
        {/* 背景グリッド */}
        {gridLines.map((points, i) => (
          <polygon
            key={i}
            points={points}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        ))}
        {/* 軸線 */}
        {Array.from({ length: pointsCount }).map((_, i) => {
          const r = radius;
          const angle = i * angleStep - Math.PI / 2;
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={center + r * Math.cos(angle)}
              y2={center + r * Math.sin(angle)}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          );
        })}

        {/* 面積エリア (Polygon) */}
        {skills.length > 0 && (
          <polygon
            points={dataPoints}
            fill={color}
            fillOpacity="0.25"
            stroke={color}
            strokeWidth="3"
            strokeLinejoin="round"
            className="drop-shadow-sm"
          />
        )}

        {/* 各頂点のドット */}
        {skills.map((s, i) => {
          const { x, y } = getCoordinates(i, s.level, progress);
          return (
            <circle 
              key={`${s.id}-${i}`} 
              cx={x} 
              cy={y} 
              r={progress > 0.1 ? 4 : 0}
              fill={color} 
              className="stroke-white stroke-2 shadow-sm"
            />
          );
        })}

        {/* 項目ラベル */}
        {labels}

        {/* 目盛り数字 */}
        {[1, 2, 3, 4, 5].map(l => {
             const r = (radius / levels) * l;
             return <text key={l} x={center} y={center - r} textAnchor="middle" className="text-[9px] fill-gray-300 font-mono" dy="-4">{l}</text>
        })}
      </svg>
    </div>
  );
};