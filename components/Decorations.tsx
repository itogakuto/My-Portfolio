import React from 'react';

interface Props {
  className?: string;
  opacity?: number;
}

// 鹿の線画 (画像ファイル読み込み)
// Note: Please place 'deer-line-art.png' in the public directory.
export const DeerLineArt: React.FC<Props> = ({ className = "", opacity = 0.1 }) => (
  <img 
    src="/deer-line-art.png" 
    alt="Deer Line Art" 
    className={className} 
    style={{ opacity }} 
  />
);

// 猪の線画 (画像ファイル読み込み)
// Note: Please place 'boar-line-art.png' in the public directory.
export const BoarLineArt: React.FC<Props> = ({ className = "", opacity = 0.1 }) => (
  <img 
    src="/boar-line-art.png" 
    alt="Boar Line Art" 
    className={className} 
    style={{ opacity }} 
  />
);