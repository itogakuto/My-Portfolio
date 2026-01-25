import React from 'react';

interface Props {
  className?: string;
  opacity?: number;
}

// 鹿の線画 (画像ファイル読み込み)
export const DeerLineArt: React.FC<Props> = ({ className = "", opacity = 0.1 }) => (
  <img 
    src="/images/experiences/deer.png" 
    alt="Deer Line Art" 
    className={className} 
    style={{ opacity }} 
  />
);

// 猪の線画 (画像ファイル読み込み)
export const BoarLineArt: React.FC<Props> = ({ className = "", opacity = 0.1 }) => (
  <img 
    src="/images/experiences/boar.png" 
    alt="Boar Line Art" 
    className={className} 
    style={{ opacity }} 
  />
);