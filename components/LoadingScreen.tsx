import React, { useState, useEffect } from 'react';

interface Props {
  onComplete: () => void;
  isInitial?: boolean;
}

export const LoadingScreen: React.FC<Props> = ({ onComplete, isInitial = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isPreloaded, setIsPreloaded] = useState(false);

  const allImages = [
    "/images/loading-images/1.webp",
    "/images/loading-images/2.webp",
    "/images/loading-images/3.webp",
    "/images/loading-images/4.webp",
    "/images/loading-images/1.webp",
  ];

  // 初回は5枚、遷移時は3枚
  const displayImages = isInitial ? allImages : allImages.slice(0, 3);
  const intervalTime = isInitial ? 280 : 220; // 切り替え速度 (ms)
  const minDurationMs = isInitial ? 600 : 250;
  const maxDurationMs = isInitial ? 1500 : 650;

  useEffect(() => {
    let isCancelled = false;
    const preloadImages = async () => {
      const targets = isInitial ? allImages.slice(0, 4) : allImages.slice(0, 3);
      await Promise.allSettled(
        targets.map(
          (src) =>
            new Promise<void>((resolve) => {
              const img = new Image();
              img.onload = () => resolve();
              img.onerror = () => resolve();
              img.src = src;
            })
        )
      );
      if (!isCancelled) setIsPreloaded(true);
    };
    preloadImages();
    return () => {
      isCancelled = true;
    };
  }, [isInitial]);

  useEffect(() => {
    let intervalId: number;
    let minTimerId: number;
    let maxTimerId: number;
    let done = false;
    let minElapsed = false;
    let pageLoaded = !isInitial;

    const finish = () => {
      if (done) return;
      done = true;
      setIsVisible(false);
      window.setTimeout(onComplete, 600); // フェードアウト完了後に親に通知
    };

    const tryFinish = () => {
      if (minElapsed && pageLoaded && isPreloaded) finish();
    };

    intervalId = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayImages.length);
    }, intervalTime);

    minTimerId = window.setTimeout(() => {
      minElapsed = true;
      tryFinish();
    }, minDurationMs);

    maxTimerId = window.setTimeout(() => {
      finish();
    }, maxDurationMs);

    const onLoad = () => {
      pageLoaded = true;
      tryFinish();
    };

    if (isInitial && document.readyState !== 'complete') {
      window.addEventListener('load', onLoad);
    } else {
      pageLoaded = true;
      tryFinish();
    }

    return () => {
      window.removeEventListener('load', onLoad);
      clearInterval(intervalId);
      clearTimeout(minTimerId);
      clearTimeout(maxTimerId);
    };
  }, [displayImages.length, intervalTime, isInitial, isPreloaded, maxDurationMs, minDurationMs, onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-[10000] bg-earth-50 flex flex-col items-center justify-center transition-opacity duration-700 ease-in-out ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="relative">
        {/* 画像コンテナ: 中央に小さく配置 */}
        <div className="w-64 h-64 md:w-[450px] md:h-[450px] mb-12 relative border border-earth-100 bg-white shadow-2xl flex items-center justify-center overflow-hidden rounded-2xl">
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
