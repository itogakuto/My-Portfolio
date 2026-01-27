
import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { supabase } from '../services/supabase';
import { Experience } from '../types';
import { DeerLineArt } from '../components/Decorations';
import { resolveImageUrl } from '../components/TopicCard';

export const ExperienceList: React.FC = () => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0); 
  const [isFlipping, setIsFlipping] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchExperiences = async () => {
      setLoading(true);
      // sort_order 昇順を第一優先
      const { data } = await supabase.from('experiences').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: false });
      if (data && data.length > 0) {
        setExperiences(data);
      } else {
        setExperiences([
          { id: 'e1', title: '秘境でのソロキャンプ', slug: 'solo-camp', summary: '電気もガスもない環境で1週間過ごした記録。自然と向き合う中で得た、サバイバル技術と深い内省の記録。', body: '詳細な記録：火起こしから食料の調達、野生動物との遭遇など、都市生活では味わえない「生」の感覚を研ぎ澄ませた時間でした。', created_at: new Date().toISOString() },
          { id: 'e2', title: 'ビンテージカメラの修復', slug: 'camera-restore', summary: '1950年代の機械式カメラを分解・清掃。当時の技術者の魂を感じる時間。', body: '修復過程で、精密な歯車の組み合わせが織りなす工学の粋に触れました。道具を長く使うことの意義を再確認する経験となりました。', created_at: new Date().toISOString() },
          { id: 'e3', title: '古民家再生プロジェクト', slug: 'old-house', summary: '地域の方々と協力し、放置されていた空き家をコミュニティ拠点へ。継承される知恵と新しい息吹。', body: '茅葺き屋根の補修や土壁の塗り直しなど、伝統的な建築手法を学びつつ、現代のニーズに合わせたリノベーションを行いました。', created_at: new Date().toISOString() },
          { id: 'e4', title: 'ドローン空撮の旅', slug: 'drone-trip', summary: '日本の原風景を空から記録。鳥の視点で見つめ直す、愛すべき土地の物語。', body: '上空からの視点は、普段見ている景色を一変させ、地形や植生が織りなす模様の美しさを教えてくれました。', created_at: new Date().toISOString() }
        ]);
      }
      setLoading(false);
    };
    fetchExperiences();
  }, []);

  const totalSpreadsDesktop = Math.ceil(experiences.length / 2) + 1;
  const totalSpreadsMobile = experiences.length + 1;
  const totalPages = isMobile ? totalSpreadsMobile : totalSpreadsDesktop;

  const nextPage = () => {
    if (currentPage < totalPages - 1 && !isFlipping) {
      setIsFlipping(true);
      setCurrentPage(prev => prev + 1);
      setTimeout(() => setIsFlipping(false), 800);
    }
  };

  const prevPage = () => {
    if (currentPage > 0 && !isFlipping) {
      setIsFlipping(true);
      setCurrentPage(prev => prev - 1);
      setTimeout(() => setIsFlipping(false), 800);
    }
  };

  const goToFirst = () => {
    if (currentPage !== 0 && !isFlipping) {
      setIsFlipping(true);
      setCurrentPage(0);
      setTimeout(() => setIsFlipping(false), 800);
    }
  };

  const goToLast = () => {
    if (currentPage !== totalPages - 1 && !isFlipping) {
      setIsFlipping(true);
      setCurrentPage(totalPages - 1);
      setTimeout(() => setIsFlipping(false), 800);
    }
  };

  useEffect(() => {
    if (currentPage >= totalPages) {
      setCurrentPage(totalPages - 1);
    }
  }, [isMobile, totalPages]);

  const getDesktopZIndex = (spreadIdx: number) => {
    if (spreadIdx < currentPage) return spreadIdx + 10;
    if (spreadIdx === currentPage) return 200;
    return (totalPages - spreadIdx) + 50;
  };

  const getMobileZIndex = (pageIdx: number) => {
    if (pageIdx < currentPage) return pageIdx + 10;
    if (pageIdx === currentPage) return 200;
    return (totalPages - pageIdx) + 50;
  };

  return (
    <Layout>
      <div className="pt-24 pb-32 bg-earth-200 min-h-screen flex flex-col items-center overflow-x-hidden font-serif">
        <div className="w-full max-w-5xl px-4 md:px-6 flex flex-col items-center">
          
          <div className="mb-8 md:mb-12 text-center animate-fadeIn">
            <h1 className="text-2xl md:text-3xl font-bold text-earth-900 tracking-[0.2em] leading-tight uppercase">
              Field Records
            </h1>
            <p className="text-[9px] md:text-[10px] uppercase tracking-[0.4em] text-earth-500 mt-2 font-sans font-bold">
              これまでの経験・体験の記録
            </p>
          </div>

          {loading ? (
            <div className="h-[60vh] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-600"></div>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center">
              
              {!isMobile && (
                <div className="hidden md:block w-full max-w-4xl relative">
                  <div className="book-container relative w-full aspect-[4/3] max-h-[70vh]">
                    <div className="book relative w-full h-full transform-style-3d" style={{ transform: `translateX(${currentPage === 0 ? '-25%' : '0%'})`, transition: 'transform 1s ease' }}>
                      <div className="absolute inset-0 bg-earth-900/10 blur-xl rounded-full transform translate-y-10 scale-x-90 opacity-20 pointer-events-none"></div>

                      <div 
                        className="page book-page" 
                        style={{ 
                          zIndex: getDesktopZIndex(0),
                          transform: currentPage > 0 ? 'rotateY(-180deg)' : 'none',
                          WebkitTransform: currentPage > 0 ? 'rotateY(-180deg)' : 'none'
                        }} 
                        onClick={() => currentPage === 0 && nextPage()}
                      >
                        <div className="page-front bg-forest-900 border-r-4 border-forest-800 rounded-r-xl shadow-2xl flex flex-col items-center justify-center p-12 overflow-hidden">
                           <div className="absolute inset-4 border border-forest-700/20"></div>
                           <div className="relative z-10 flex flex-col items-center text-center">
                              <img className="w-60 h-auto mb-6" src="/images/book-image/takibi.png" alt="takibi Line Art" />
                              <h2 className="text-4xl font-bold text-earth-100 mb-4 tracking-tighter">My Experiences</h2>
                              <p className="text-earth-400 text-xs tracking-[0.5em] uppercase font-sans font-bold">Vol.01</p>
                           </div>
                        </div>
                        <div className="page-back bg-earth-50 rounded-l-xl p-12 shadow-inner border-r border-earth-200">
                           <div className="h-full border border-earth-200/50 p-8 flex flex-col items-center justify-center text-center italic text-earth-600 text-sm leading-relaxed">
                              私のこれまでの体験の全ては、<br />
                              私の視座を形成する重要なピースです。<br />
                              私の身に起きる全ての経験が、<br />
                              自身をより豊かに、面白く、<br />
                              より大きく成長させてくれると<br />
                              信じています。
                           </div>
                        </div>
                      </div>

                      {Array.from({ length: totalSpreadsDesktop - 1 }).map((_, i) => {
                        const item1 = experiences[i * 2];
                        const item2 = experiences[i * 2 + 1];
                        const spreadIdx = i + 1;
                        return (
                          <div 
                            key={i} 
                            className="page book-page" 
                            style={{ 
                              zIndex: getDesktopZIndex(spreadIdx),
                              transform: currentPage > spreadIdx ? 'rotateY(-180deg)' : 'none',
                              WebkitTransform: currentPage > spreadIdx ? 'rotateY(-180deg)' : 'none'
                            }} 
                            onClick={() => currentPage === spreadIdx && nextPage()}
                          >
                            <div className="page-front bg-earth-50 border-r border-earth-200 shadow-inner p-10 flex flex-col overflow-hidden">
                               {item1 && (
                                 <>
                                    <div className="aspect-video mb-6 overflow-hidden rounded bg-earth-200 flex-shrink-0">
                                       <img src={resolveImageUrl(item1.image_url, item1.id)} className="w-full h-full object-cover filter sepia-[0.3]" alt="" />
                                    </div>
                                    <h4 className="text-xl font-bold text-earth-900 mb-4 border-b border-earth-100 pb-2 flex-shrink-0">{item1.title}</h4>
                                    <div className="flex-grow overflow-y-auto pr-4 custom-scrollbar">
                                      <p className="text-sm text-earth-700 leading-relaxed mb-4">{item1.summary}</p>
                                      {item1.body && <p className="text-sm text-earth-600 leading-relaxed border-t border-earth-100 pt-4 mt-4 italic">{item1.body}</p>}
                                    </div>
                                    <div className="mt-4 text-right text-[10px] font-mono text-earth-300 italic flex-shrink-0">Page. {i * 2 + 1}</div>
                                 </>
                               )}
                            </div>
                            <div className="page-back bg-earth-50 border-l border-earth-200 shadow-inner p-10 flex flex-col overflow-hidden">
                               {item2 ? (
                                 <>
                                    <div className="aspect-video mb-6 overflow-hidden rounded bg-earth-200 flex-shrink-0">
                                       <img src={resolveImageUrl(item2.image_url, item2.id)} className="w-full h-full object-cover filter sepia-[0.3]" alt="" />
                                    </div>
                                    <h4 className="text-xl font-bold text-earth-900 mb-4 border-b border-earth-100 pb-2 flex-shrink-0">{item2.title}</h4>
                                    <div className="flex-grow overflow-y-auto pr-4 custom-scrollbar">
                                      <p className="text-sm text-earth-700 leading-relaxed mb-4">{item2.summary}</p>
                                      {item2.body && <p className="text-sm text-earth-600 leading-relaxed border-t border-earth-100 pt-4 mt-4 italic">{item2.body}</p>}
                                    </div>
                                    <div className="mt-4 text-left text-[10px] font-mono text-earth-300 italic flex-shrink-0"># {i * 2 + 2}</div>
                                 </>
                               ) : (
                                 <div className="h-full flex flex-col items-center justify-center opacity-20 italic">
                                    <div className="w-12 h-px bg-earth-300 mb-6"></div>
                                    <p className="text-xs uppercase tracking-widest">Finis</p>
                                 </div>
                               )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {isMobile && (
                <div className="md:hidden w-full max-w-[320px] relative">
                  <div className="notebook-container relative w-full aspect-[3/4.5] max-h-[65vh]">
                    <div className="absolute inset-0 bg-earth-50 rounded-b-xl shadow-lg border-x border-b border-earth-300 transform translate-y-1">
                       <div className="h-full flex items-center justify-center opacity-20 p-8 text-center italic text-xs text-earth-400">
                          Looking for the next insight...
                       </div>
                    </div>

                    <div className="notebook relative w-full h-full transform-style-3d">
                      <div 
                        className="page note-page" 
                        style={{ 
                          zIndex: getMobileZIndex(0),
                          transform: currentPage > 0 ? 'rotateX(155deg)' : 'none',
                          WebkitTransform: currentPage > 0 ? 'rotateX(155deg)' : 'none'
                        }} 
                        onClick={() => currentPage === 0 && nextPage()}
                      >
                         <div className="page-front bg-forest-900 border-x-2 border-b-2 border-forest-800 rounded-b-xl shadow-2xl flex flex-col items-center justify-center p-6 text-center">
                            <img className="w-60 h-auto mb-6" src="/images/book-image/takibi.png" alt="takibi Line Art" />
                            <h2 className="text-2xl font-bold text-earth-100 mb-2">My Experiences</h2>
                            <p className="text-[8px] tracking-[0.4em] uppercase font-sans font-bold text-earth-400">Vol.01</p>
                         </div>
                         <div className="page-back bg-earth-100 rounded-t-xl p-8 shadow-inner border-x border-t border-earth-200">
                            <div className="h-full border border-earth-200/50 p-4 flex flex-col items-center justify-center text-center italic text-earth-600 text-xs">
                              私のこれまでの体験の全ては、<br />
                              私の視座を形成する重要なピースです。<br />
                              私の身に起きる全ての経験が、<br />
                              自身をより豊かに、面白く、<br />
                              より大きく成長させてくれると<br />
                              信じています。
                            </div>
                         </div>
                      </div>

                      {experiences.map((exp, i) => {
                        const pageIdx = i + 1;
                        const isFlipped = currentPage > pageIdx;
                        return (
                          <div 
                            key={exp.id} 
                            className="page note-page" 
                            style={{ 
                              zIndex: getMobileZIndex(pageIdx),
                              transform: isFlipped ? 'rotateX(155deg)' : 'none',
                              WebkitTransform: isFlipped ? 'rotateX(155deg)' : 'none'
                            }} 
                            onClick={() => currentPage === pageIdx && nextPage()}
                          >
                             <div className="page-front bg-earth-50 border-x border-b border-earth-200 shadow-md p-5 flex flex-col overflow-hidden">
                                <div className="aspect-[16/10] mb-4 overflow-hidden rounded bg-earth-200 flex-shrink-0">
                                   <img src={resolveImageUrl(exp.image_url, exp.id)} className="w-full h-full object-cover filter sepia-[0.3]" alt="" />
                                </div>
                                <h4 className="text-lg font-bold text-earth-900 mb-2 border-b border-earth-100 pb-1 flex-shrink-0">{exp.title}</h4>
                                <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
                                  <p className="text-xs text-earth-700 leading-relaxed mb-4">{exp.summary}</p>
                                  {exp.body && <p className="text-[10px] text-earth-500 italic mt-2 border-t border-earth-100 pt-2">{exp.body}</p>}
                                </div>
                             </div>
                             <div className="page-back bg-earth-100 rounded-t-xl p-6 shadow-inner border-x border-t border-earth-200 overflow-hidden flex flex-col">
                                <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar text-center flex flex-col justify-center italic text-earth-500 text-[10px] leading-relaxed">
                                   {exp.body || "この経験が未来への道標となります。"}
                                </div>
                             </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="absolute top-0 left-0 w-full h-4 z-[200] flex justify-around px-4">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className="w-2 h-5 bg-gradient-to-b from-earth-400 to-earth-600 rounded-full shadow-md -translate-y-3"></div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-20 md:mt-24 w-full max-w-2xl flex justify-center items-center gap-4 md:gap-8 px-4">
                 <button onClick={goToFirst} disabled={currentPage === 0 || isFlipping} className="group flex flex-col items-center gap-2 text-earth-300 hover:text-forest-700 disabled:opacity-5 transition-all" title="First Page">
                    <span className="text-[8px] tracking-widest uppercase font-bold opacity-0 group-hover:opacity-100 transition-opacity">Start</span>
                    <div className="w-10 h-10 flex items-center justify-center rounded-full border border-current"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg></div>
                 </button>
                 <button onClick={prevPage} disabled={currentPage === 0 || isFlipping} className="group flex flex-col items-center gap-2 text-earth-400 hover:text-forest-700 disabled:opacity-10 transition-all">
                    <span className="text-[10px] tracking-widest uppercase font-bold">Prev</span>
                    <div className="w-12 h-12 flex items-center justify-center rounded-full border border-current"><svg className={`w-4 h-4 ${isMobile ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobile ? "M19 9l-7 7-7-7" : "M15 19l-7-7 7-7"} /></svg></div>
                 </button>
                 <div className="text-center min-w-[80px]">
                    <div className="text-earth-900 font-bold text-lg md:text-xl">{currentPage} / {totalPages - 1}</div>
                    <div className="text-[9px] text-earth-400 tracking-widest uppercase font-bold">{isMobile ? 'Entry' : 'Spread'}</div>
                 </div>
                 <button onClick={nextPage} disabled={currentPage === totalPages - 1 || isFlipping} className="group flex flex-col items-center gap-2 text-earth-400 hover:text-forest-700 disabled:opacity-10 transition-all">
                    <span className="text-[10px] tracking-widest uppercase font-bold">Next</span>
                    <div className="w-12 h-12 flex items-center justify-center rounded-full border border-current"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobile ? "M19 9l-7 7-7-7" : "M9 5l7 7-7 7"} /></svg></div>
                 </button>
                 <button onClick={goToLast} disabled={currentPage === totalPages - 1 || isFlipping} className="group flex flex-col items-center gap-2 text-earth-300 hover:text-forest-700 disabled:opacity-5 transition-all" title="Last Page">
                    <span className="text-[8px] tracking-widest uppercase font-bold opacity-0 group-hover:opacity-100 transition-opacity">End</span>
                    <div className="w-10 h-10 flex items-center justify-center rounded-full border border-current"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg></div>
                 </button>
              </div>
            </div>
          )}
          <div className="mt-32 md:mt-48">
             <button onClick={() => window.history.back()} className="text-[10px] font-black text-earth-400 hover:text-forest-600 transition-all uppercase tracking-[0.4em] flex items-center gap-3"><span className="text-lg">←</span> Return to Home</button>
          </div>
        </div>
      </div>
      <style>{`
        .transform-style-3d { 
          transform-style: preserve-3d; 
          -webkit-transform-style: preserve-3d; 
        }
        .page { 
          position: absolute; 
          top: 0; 
          width: 100%; 
          height: 100%; 
          transition: transform 0.8s cubic-bezier(0.645, 0.045, 0.355, 1); 
          transform-style: preserve-3d; 
          -webkit-transform-style: preserve-3d;
          cursor: pointer; 
          -webkit-tap-highlight-color: transparent;
          will-change: transform;
        }
        .page-front, .page-back { 
          position: absolute; 
          top: 0; 
          left: 0; 
          width: 100%; 
          height: 100%; 
          backface-visibility: hidden; 
          -webkit-backface-visibility: hidden;
          box-sizing: border-box; 
          background-image: url("https://www.transparenttextures.com/patterns/handmade-paper.png");
          -webkit-transform: translateZ(0);
          transform: translateZ(0);
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #a89482; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #725d4e; }
        @media (min-width: 768px) { 
          .book-container { 
            perspective: 2500px; 
            -webkit-perspective: 2500px;
            -webkit-perspective-origin: center center;
            perspective-origin: center center;
          } 
          .book-page { 
            right: 0; 
            width: 50%; 
            transform-origin: left center; 
            -webkit-transform-origin: left center;
          } 
          .book-page .page-back { 
            transform: rotateY(180deg) translateZ(0);
            -webkit-transform: rotateY(180deg) translateZ(0);
          }
        }
        @media (max-width: 767px) { 
          .notebook-container { 
            perspective: 2000px; 
            -webkit-perspective: 2000px;
            -webkit-perspective-origin: center top;
            perspective-origin: center top;
          } 
          .note-page { 
            left: 0; 
            transform-origin: top center; 
            -webkit-transform-origin: top center;
          } 
          .note-page .page-back { 
            transform: rotateX(180deg) translateZ(0);
            -webkit-transform: rotateX(180deg) translateZ(0);
          }
        }
        .page-front { 
          box-shadow: inset 10px 0 30px rgba(0,0,0,0.02); 
        }
        .page-back { 
          box-shadow: inset -10px 0 30px rgba(0,0,0,0.02); 
        }
        .page.flipped .page-back { 
          box-shadow: 0 10px 30px rgba(0,0,0,0.1); 
        }
      `}</style>
    </Layout>
  );
};
