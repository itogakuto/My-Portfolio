import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { supabase } from '../services/supabase';
import { Experience } from '../types';
import { resolveImageUrl } from '../components/TopicCard';

export const ExperienceList: React.FC = () => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0); 
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    const fetchExperiences = async () => {
      setLoading(true);
      const { data } = await supabase.from('experiences').select('*').order('created_at', { ascending: false });
      if (data && data.length > 0) {
        setExperiences(data);
      } else {
        // フォールバック
        setExperiences([
          { id: 'e1', title: '秘境でのソロキャンプ', slug: 'solo-camp', summary: '電気もガスもない環境で1週間過ごした記録。自然と向き合う中で得た、サバイバル技術と深い内省の記録。', created_at: new Date().toISOString() },
          { id: 'e2', title: 'ビンテージカメラの修復', slug: 'camera-restore', summary: '1950年代の機械式カメラを分解・清掃。緻密な機構の中に、当時の技術者の魂を感じる時間。', created_at: new Date().toISOString() },
          { id: 'e3', title: '古民家再生プロジェクト', slug: 'old-house', summary: '地域の方々と協力し、放置されていた空き家をコミュニティ拠点へ。継承される知恵と新しい息吹。', created_at: new Date().toISOString() },
          { id: 'e4', title: 'ドローン空撮の旅', slug: 'drone-trip', summary: '日本の原風景を空から記録。鳥の視点で見つめ直す、愛すべき土地の物語。', created_at: new Date().toISOString() }
        ]);
      }
      setLoading(false);
    };
    fetchExperiences();
  }, []);

  const totalSpreads = Math.ceil(experiences.length / 2) + 1; 

  const nextPage = () => {
    if (currentPage < totalSpreads - 1 && !isFlipping) {
      setIsFlipping(true);
      setCurrentPage(prev => prev + 1);
      setTimeout(() => setIsFlipping(false), 1200);
    }
  };

  const prevPage = () => {
    if (currentPage > 0 && !isFlipping) {
      setIsFlipping(true);
      setCurrentPage(prev => prev - 1);
      setTimeout(() => setIsFlipping(false), 1200);
    }
  };

  return (
    <Layout>
      <div className="pt-24 pb-12 bg-earth-200 min-h-screen flex items-center justify-center overflow-hidden font-serif">
        <div className="relative w-full max-w-5xl px-4 md:px-12 flex flex-col items-center">
          
          <div className="mb-12 text-center animate-fadeIn">
            <h1 className="text-2xl md:text-3xl font-bold text-earth-900 tracking-widest">
              a book of Experience
            </h1>
            <p className="text-[10px] uppercase tracking-[0.4em] text-earth-500 mt-2">
              多様な好奇心と経験の記録
            </p>
          </div>

          {loading ? (
            <div className="h-[60vh] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-600"></div>
            </div>
          ) : (
            <div className="book-container relative w-full aspect-[4/3] max-h-[70vh]">
              <div 
                className="book relative w-full h-full transition-all duration-1000 ease-in-out"
                style={{ 
                  transform: `translateX(${currentPage === 0 ? '-25%' : '0%'})` 
                }}
              >
                <div 
                  className="absolute bg-black/30 blur-[40px] rounded-[20%] transition-all duration-1000 ease-in-out pointer-events-none"
                  style={{
                    bottom: '-40px',
                    height: '60px',
                    left: currentPage === 0 ? '55%' : '5%',
                    width: currentPage === 0 ? '40%' : '90%',
                    opacity: isFlipping ? 0.15 : (currentPage === 0 ? 0.4 : 0.25),
                    transform: `scale(${isFlipping ? 0.95 : 1})`,
                  }}
                ></div>
                
                <div 
                  className={`page cover-page ${currentPage > 0 ? 'flipped' : ''}`}
                  style={{ zIndex: currentPage === 0 ? 100 : 1 }}
                  onClick={() => currentPage === 0 && nextPage()}
                >
                  <div className="page-front bg-earth-900 border-4 border-earth-300 rounded-r-xl shadow-2xl flex flex-col items-center justify-center p-12 text-center overflow-hidden">
                    <div className="absolute inset-4 border border-earth-700/50"></div>
                    <div className="relative z-10">
                       <div className="w-60 h-60 mb-8 mx-auto opacity-40">
                         <img src="/images/book-image/takibi.png" alt="Emblem" className="w-full h-full object-contain" />
                       </div>
                       <h2 className="text-3xl md:text-5xl font-bold text-earth-100 leading-tight mb-6">
                         Experiences
                       </h2>
                       <div className="w-16 h-px bg-earth-400 mx-auto mb-6"></div>
                       <p className="text-earth-400 text-xs italic tracking-widest uppercase">Ito Gakuto</p>
                    </div>
                  </div>
                  <div className="page-back bg-earth-100 rounded-l-xl border-r border-earth-200 p-12 shadow-inner">
                    <div className="h-full border border-earth-200/50 p-8 flex flex-col justify-center items-center text-center">
                       <h3 className="text-2xl text-earth-800 mb-6 font-bold">はじめに</h3>
                       <p className="text-earth-600 text-sm leading-relaxed mb-4">
                         僕の興味は狩猟だけではありません。<br />
                         <br />
                         <br />
                         
                       </p>
                       <p className="text-earth-600 text-sm leading-relaxed italic">
                         静かにページを捲り、その欠片に触れてみてください。
                       </p>
                    </div>
                  </div>
                </div>

                {Array.from({ length: totalSpreads - 1 }).map((_, spreadIndex) => {
                  const itemIndex1 = spreadIndex * 2;
                  const itemIndex2 = spreadIndex * 2 + 1;
                  const item1 = experiences[itemIndex1];
                  const item2 = experiences[itemIndex2];
                  const isFlipped = currentPage > spreadIndex + 1;
                  
                  return (
                    <div 
                      key={spreadIndex}
                      className={`page content-page ${isFlipped ? 'flipped' : ''}`}
                      style={{ 
                        zIndex: isFlipped ? 10 + spreadIndex : (totalSpreads - spreadIndex + 10) 
                      }}
                    >
                       <div className="page-front bg-earth-50 border-r border-earth-200 shadow-inner p-10 flex flex-col">
                          {item1 ? (
                            <div className="h-full flex flex-col">
                               <div className="mb-6 aspect-video overflow-hidden rounded bg-earth-200 shadow-inner">
                                  <img 
                                    src={resolveImageUrl(item1.image_url, item1.id)} 
                                    className="w-full h-full object-cover filter sepia-[0.4] contrast-[0.9]" 
                                    alt={item1.title} 
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      const fallback = `https://picsum.photos/seed/${item1.id}/800/450?grayscale`;
                                      if (target.src !== fallback) target.src = fallback;
                                    }}
                                  />
                               </div>
                               <h4 className="text-xl font-bold text-earth-900 mb-4">{item1.title}</h4>
                               <p className="text-sm text-earth-700 leading-relaxed flex-grow">
                                 {item1.summary}
                               </p>
                               <div className="text-[10px] text-earth-400 font-mono mt-4 text-right italic"># {itemIndex1 + 1}</div>
                            </div>
                          ) : (
                            <div className="h-full flex items-center justify-center opacity-10 grayscale">
                              <img src="/deer-line-art.png" alt="" className="w-32" />
                            </div>
                          )}
                       </div>
                       <div className="page-back bg-earth-50 border-l border-earth-200 shadow-inner p-10 flex flex-col">
                          {item2 ? (
                            <div className="h-full flex flex-col">
                               <div className="mb-6 aspect-video overflow-hidden rounded bg-earth-200 shadow-inner">
                                  <img 
                                    src={resolveImageUrl(item2.image_url, item2.id)} 
                                    className="w-full h-full object-cover filter sepia-[0.4] contrast-[0.9]" 
                                    alt={item2.title} 
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      const fallback = `https://picsum.photos/seed/${item2.id}/800/450?grayscale`;
                                      if (target.src !== fallback) target.src = fallback;
                                    }}
                                  />
                               </div>
                               <h4 className="text-xl font-bold text-earth-900 mb-4">{item2.title}</h4>
                               <p className="text-sm text-earth-700 leading-relaxed flex-grow">
                                 {item2.summary}
                               </p>
                               <div className="text-[10px] text-earth-400 font-mono mt-4 text-left italic"># {itemIndex2 + 1}</div>
                            </div>
                          ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8">
                               <div className="w-12 h-px bg-earth-300 mb-6"></div>
                               <p className="text-xs text-earth-400 italic tracking-widest">FINIS</p>
                               <div className="w-12 h-px bg-earth-300 mt-6"></div>
                            </div>
                          )}
                       </div>
                    </div>
                  );
                })}
                
                <div className="absolute top-0 left-1/2 w-[2px] h-full bg-earth-900/10 z-[150] shadow-[0_0_15px_rgba(0,0,0,0.2)]"></div>
              </div>

              <div className="absolute bottom-[-100px] left-0 w-full flex justify-between items-center px-4">
                <button 
                  onClick={prevPage}
                  disabled={currentPage === 0 || isFlipping}
                  className="group flex items-center gap-4 text-earth-600 font-bold hover:text-forest-700 disabled:opacity-20 transition-all uppercase tracking-[0.3em] text-[10px]"
                >
                  <span className="w-16 h-px bg-earth-400 group-hover:bg-forest-600 transition-all"></span>
                  Previous
                </button>
                
                <div className="bg-earth-900/5 px-6 py-2 rounded-full text-earth-500 text-[10px] font-mono tracking-widest">
                  SPREAD {currentPage} / {totalSpreads - 1}
                </div>

                <button 
                  onClick={nextPage}
                  disabled={currentPage === totalSpreads - 1 || isFlipping}
                  className="group flex items-center gap-4 text-earth-600 font-bold hover:text-forest-700 disabled:opacity-20 transition-all uppercase tracking-[0.3em] text-[10px]"
                >
                  Next
                  <span className="w-16 h-px bg-earth-400 group-hover:bg-forest-600 transition-all"></span>
                </button>
              </div>
            </div>
          )}
          
          <div className="mt-36">
             <button onClick={() => window.history.back()} className="text-[10px] font-bold text-earth-400 hover:text-forest-600 transition-colors uppercase tracking-[0.4em]">
                ← Back to Home
             </button>
          </div>
        </div>
      </div>

      <style>{`
        .book-container {
          perspective: 2500px;
        }
        
        .book {
          transform-style: preserve-3d;
        }

        .page {
          position: absolute;
          top: 0;
          right: 0;
          width: 50%;
          height: 100%;
          transform-origin: left center;
          transition: transform 1.2s cubic-bezier(0.645, 0.045, 0.355, 1);
          transform-style: preserve-3d;
          cursor: pointer;
        }

        .page.flipped {
          transform: rotateY(-180deg) rotateZ(-0.5deg) skewY(-0.3deg) scale(0.99);
        }

        .page-front, .page-back {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          box-sizing: border-box;
          overflow: hidden;
          transition: box-shadow 1.2s ease;
          background-image: url("https://www.transparenttextures.com/patterns/handmade-paper.png");
        }

        .page-back {
          transform: rotateY(180deg);
        }

        .page-front {
          box-shadow: inset 25px 0 60px -25px rgba(0,0,0,0.1);
        }
        .page-back {
          box-shadow: inset -25px 0 60px -25px rgba(0,0,0,0.1);
        }

        .cover-page .page-front {
          background-image: url("https://www.transparenttextures.com/patterns/black-linen.png") !important;
          background-color: #423732;
          box-shadow: inset 4px 0 15px rgba(0,0,0,0.4), 15px 15px 40px rgba(0,0,0,0.3);
        }
        
        .page::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to right, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0) 10%, rgba(0,0,0,0) 90%, rgba(0,0,0,0.05) 100%);
          pointer-events: none;
        }
      `}</style>
    </Layout>
  );
};