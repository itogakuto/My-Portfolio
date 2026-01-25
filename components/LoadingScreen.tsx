import React, { useState, useEffect } from 'react';

interface Props {
  onComplete: () => void;
  isInitial?: boolean;
}

export const LoadingScreen: React.FC<Props> = ({ onComplete, isInitial = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // 農業・生命・工学を象徴する線画風画像（CSSフィルタで線画風に調整）
  const allImages = [
    "https://images.unsplash.com/photo-1484406566174-9da000fda645?q=80&w=400&auto=format&fit=crop", // 鹿（野生動物）
    "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=400&auto=format&fit=crop", // 若葉（農業）
    "https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=400&auto=format&fit=crop", // 歯車/機械（工学）
    "https://images.unsplash.com/photo-1542601906960-da01fb732191?q=80&w=400&auto=format&fit=crop", // 木の葉（自然）
    "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=400&auto=format&fit=crop"  // 地図/データ（フィールドワーク）
  ];

  // 初回は5枚、遷移時は3枚
  const displayImages = isInitial ? allImages : allImages.slice(0, 3);
  const intervalTime = 400; // 切り替え速度 (ms)

  useEffect(() => {
    let timer: number;
    let count = 0;

    const runSequence = () => {
      timer = window.setInterval(() => {
        count++;
        if (count < displayImages.length) {
          setCurrentIndex(count);
        } else {
          clearInterval(timer);
          // 最後の画像が表示された後、少し溜めてからフェードアウト
          setTimeout(() => {
            setIsVisible(false);
            setTimeout(onComplete, 800); // フェードアウト完了後に親に通知
          }, 300);
        }
      }, intervalTime);
    };

    runSequence();
    return () => clearInterval(timer);
  }, [displayImages.length, onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-[10000] bg-earth-50 flex flex-col items-center justify-center transition-opacity duration-700 ease-in-out ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="relative">
        {/* 画像コンテナ: 中央に小さく配置 */}
        <div className="w-32 h-32 md:w-40 md:h-40 mb-8 relative border border-earth-100 bg-white shadow-inner flex items-center justify-center overflow-hidden rounded-lg">
          {displayImages.map((img, idx) => (
            <img 
              key={idx}
              src={img}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-0 filter grayscale contrast-[1.2] brightness-[1.1] mix-blend-multiply ${
                currentIndex === idx ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ padding: '10%' }}
              alt=""
            />
          ))}
          {/* 線画風に見せるためのオーバーレイ（白黒調整用） */}
          <div className="absolute inset-0 bg-forest-900/5 mix-blend-overlay pointer-events-none"></div>
        </div>

        {/* テキストエリア */}
        <div className="text-center">
          <p className="text-[10px] font-black text-earth-900 tracking-[0.4em] uppercase animate-pulse">
            Now Loading
          </p>
          <div className="mt-2 flex justify-center gap-1">
            {displayImages.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-0.5 transition-all duration-300 ${
                  currentIndex === idx ? 'w-4 bg-forest-600' : 'w-1 bg-earth-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 装飾: 四隅に細いライン（製図のようなイメージ） */}
      <div className="absolute top-8 left-8 w-8 h-8 border-t border-l border-earth-200"></div>
      <div className="absolute top-8 right-8 w-8 h-8 border-t border-r border-earth-200"></div>
      <div className="absolute bottom-8 left-8 w-8 h-8 border-b border-l border-earth-200"></div>
      <div className="absolute bottom-8 right-8 w-8 h-8 border-b border-r border-earth-200"></div>
    </div>
  );
};