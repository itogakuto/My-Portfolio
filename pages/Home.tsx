import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import { Layout } from '../components/Layout';
import { SectionTitle } from '../components/SectionTitle';
import { TopicCard } from '../components/TopicCard';
import { RadarChart } from '../components/RadarChart';
import { DeerLineArt, BoarLineArt } from '../components/Decorations';
import { supabase } from '../services/supabase';
import { Topic, News, Skill, SkillCategory } from '../types';
import { CONFIG } from '../config';

export const Home: React.FC = () => {
  const [featuredTopics, setFeaturedTopics] = useState<Topic[]>([]);
  const [latestNews, setLatestNews] = useState<News[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [activeSkillTab, setActiveSkillTab] = useState<SkillCategory>('Technology');

  // インジケーターの動的スタイル管理
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  
  const [heroImages, setHeroImages] = useState<string[]>([
    "images/hero-images/1.jpg",
    "images/hero-images/2.JPG",
    "images/hero-images/3.PNG",
    "images/hero-images/4.jpg",
    "images/hero-images/5.png",
    "images/hero-images/6.png"
  ]);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  const formRef = useRef<HTMLFormElement>(null);
  const [sending, setSending] = useState(false);
  const [sentStatus, setSentStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const skillCategories: SkillCategory[] = ['On-sight', 'Technology', 'Business'];

  // タブの位置と幅を計算する関数
  const updateIndicator = () => {
    const index = skillCategories.indexOf(activeSkillTab);
    const activeTabEl = tabRefs.current[index];
    if (activeTabEl) {
      setIndicatorStyle({
        left: activeTabEl.offsetLeft,
        width: activeTabEl.offsetWidth,
      });
    }
  };

  useEffect(() => {
    updateIndicator();
    // ウィンドウのリサイズ時にも位置を再計算
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [activeSkillTab, skills]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: images } = await supabase.from('hero_images').select('image_url');
      if (images && images.length > 0) {
        setHeroImages(images.map(img => img.image_url));
      }

      const { data: topics } = await supabase.from('topics').select('*').order('sort_order', { ascending: true }).limit(3);
      const { data: news } = await supabase.from('news').select('*').order('created_at', { ascending: false });
      const { data: skillsData } = await supabase.from('skills').select('*').order('sort_order', { ascending: true });

      if (topics) setFeaturedTopics(topics);
      if (news) setLatestNews(news);
      if (skillsData) setSkills(skillsData);
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (heroImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages]);

  const sendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    if (formRef.current) {
      emailjs.sendForm(CONFIG.EMAILJS.SERVICE_ID, CONFIG.EMAILJS.TEMPLATE_ID, formRef.current, CONFIG.EMAILJS.PUBLIC_KEY)
        .then(() => {
          setSentStatus('success');
          setSending(false);
          formRef.current?.reset();
        }, (error) => {
          setSentStatus('error');
          setSending(false);
        });
    }
  };
  
  const resetSentStatus = () => {
    setSentStatus('idle');
  };

  const filteredSkills = skills.filter(s => s.category === activeSkillTab);

  const categoryInfo: Record<SkillCategory, { title: string, color: string, desc: string, levels: string[] }> = {
    'On-sight': {
      title: 'On-sight',
      color: '#34d399',
      desc: '現場で使われるツールやシステム、実際の運用等について実践的に学び、体験することで、現場のニーズに即したソリューションを提供できる力を養っています。',
      levels: ["5 - Super", "4 - Always", "3 - Often", "2 - Sometimes", "1 - Beginner"]
    },
    'Technology': {
      title: 'Technology',
      color: '#f87171',
      desc: 'フロントエンドからバックエンド、さらにはIoTデバイスの製作まで、現場の課題を解決するための実装力を磨いています。技術面では効率的かつ効果的な開発を目指しています。',
      levels: ["5 - Super", "4 - Always", "3 - Often", "2 - Sometimes", "1 - Beginner"]
    },
    'Business': {
      title: 'Business',
      color: '#349bd3',
      desc: '現場での体験やヒアリングを通じて課題の本質を捉え、それを解決するためのビジネスモデルや戦略を立案します。地域社会とのコミュニケーションを大切にし、持続可能な産業構造の構築を目指します。',
      levels: ["5 - Super", "4 - Always", "3 - Often", "2 - Sometimes", "1 - Beginner"]
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section id="hero" className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-earth-900">
           {heroImages.map((img, index) => (
             <img key={index} src={img} className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${index === currentHeroIndex ? 'opacity-50' : 'opacity-0'}`} alt="" />
           ))}
        </div>
        <div className="relative z-10 w-full bg-black/40 backdrop-blur-sm py-16">
          <div className="max-w-5xl mx-auto px-6 text-center text-white">
            <p className="text-forest-200 font-bold tracking-widest mb-6 uppercase text-sm animate-fadeIn">Field x Technology × Business</p>
            <h1 className="text-4xl md:text-7xl font-semibold serif mb-6 leading-tight text-white drop-shadow-md animate-fadeIn" style={{ animationDelay: '0.2s' }}>
              世界をより楽しくより大きく
            </h1>
            <p className="text-earth-200 max-w-3xl mx-auto mb-8 leading-relaxed text-lg animate-fadeIn" style={{ animationDelay: '0.4s' }}>
              現場×テクノロジー×ビジネスで課題を解決するエンジニア/コンサルタントを目指して。
            </p>
          </div>
        </div>
      </section>

      {/* 1. Profile Section */}
      <section id="profile" className="py-24 bg-earth-50 relative overflow-hidden">
        <DeerLineArt className="absolute top-3 right-[10px] w-80 h-80 text-forest-200 pointer-events-none object-contain" opacity={1} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
            <SectionTitle en="Profile" jp="私について" />
            <div className="flex flex-col md:flex-row items-start gap-12">
                <div className="w-full md:w-1/3">
                    <div className="aspect-[3/4] rounded-lg overflow-hidden shadow-xl bg-earth-200">
                        <img src="/images/profile/profile.png" alt="Ito Gakuto" className="w-full h-full object-cover" />
                    </div>
                </div>
                <div className="w-full md:w-2/3">
                    <h3 className="text-3xl font-bold serif text-earth-900 mb-2">伊藤 楽大 <span className="text-xl font-sans font-normal text-earth-500 ml-2">Ito Gakuto</span></h3>
                    <p className="text-forest-700 font-bold mb-6 text-lg">静岡県浜松市出身 徳島県在住<br />神山まるごと高等専門学校 デザイン・エンジニアリング学科</p>
                    <div className="prose prose-earth text-earth-700 leading-loose">
                        <p>
                          情報工学を専門とし、web開発やアプリ開発を中心に据え、新規事業開発や主催イベントの開催など、幅広く活動を行ってきました。 いずれの活動においても主体性を発揮し、それぞれの理想的な結果の実現に貢献してきました。 また、農業や狩猟などに関する好奇心が強く、多分野を横断した多角的な思考および現場の声に則したソリューションを提案するエンジニア・コンサルタントを目指しています。
                        </p>
                        <p><br />
                          現在はインターンに向けて準備を進めています。
                          これまでさまざまな活動をしてきたものの、仕事としてのクライアントへのサービス提供経験や大規模プロジェクトでの開発、実務経験が不十分であると考えています。
                        </p>
                        <p><br />
                          今後、企業様へのインターンシップや進学後の研究活動等において、さらなる技術力/ビジネススキル等の向上を目指し、多分野に知見を持つ技術的素養を持った人材として、現場主体の課題解決を通じて社会に貢献していきたいと考えています。
                        </p>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* 2. Purpose Section */}
      <section id="purpose" className="py-24 bg-white relative overflow-hidden">
        <BoarLineArt className="absolute bottom-[-140px] left-[-40px] w-80 h-80 text-earth-100 pointer-events-none -rotate-12 object-contain" opacity={1} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionTitle en="My Purpose" jp="私の志" />
          
          <div className="mt-12">
            <h3 className="text-2xl md:text-4xl font-bold serif text-earth-900 mb-10 leading-relaxed text-center md:text-left">
              あなたの世界をより楽しくより大きく<br /><br />
            </h3>
            
            <div className="prose prose-lg prose-earth text-earth-700 leading-loose space-y-8 max-w-3xl">
              <p>
                今ある世界はきっと楽しい。<br />
                今ある世界はきっと私たちに成長をもたらしてくれる。<br />
                でも、その世界がもっと楽しくなったら、もっと私たちの成長につながったら、<br />
                どんなにもワクワクする世界が待っているのだろうか。<br />
              </p>
              <p>
                私は目の前のクライアント、あなたに寄り添い、<br />
                あなたの世界をより楽しく、より大きくするために、<br />
                私の持つ力を最大限に活用し、あなたにとってのより良い世界を共に作りたい。<br />
              </p>
              <p>
                そのために、テクノロジーやビジネスの力を駆使し、現場の声に寄り添い、<br />
                私にしかできないスピードで、方法で、問題解決のためのソリューションを提案すること。<br />
                それが私の目指すエンジニア/コンサルタントの姿です。<br />
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* NEW: My Feature Section */}
      <section id="features" className="py-24 bg-earth-50 border-t border-earth-100 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <SectionTitle en="My Goals" jp="私の目標" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            {/* Goal 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-earth-100 hover:shadow-xl transition-all duration-500 group">
              <h4 className="text-[10px] font-black text-forest-600 uppercase tracking-widest mb-2">Goal 01</h4>
              <h3 className="text-xl font-bold text-earth-900 mb-4 serif">Field-Oriented<br /><span className="text-sm font-sans font-normal text-earth-500">現場至上主義</span></h3>
              <p className="text-sm text-earth-600 leading-relaxed">
                机上の空論ではなく、自らフィールドに出ることで、当事者しか気づけない「不都合な真実」や「小さな違和感」を拾い上げ、仮説・検証を繰り返して問題解決を目指します。
              </p>
            </div>

            {/* Goal 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-earth-100 hover:shadow-xl transition-all duration-500 group">
              <h4 className="text-[10px] font-black text-forest-600 uppercase tracking-widest mb-2">Goal 02</h4>
              <h3 className="text-xl font-bold text-earth-900 mb-4 serif">Critical Analysis<br /><span className="text-sm font-sans font-normal text-earth-500">批判的分析力</span></h3>
              <p className="text-sm text-earth-600 leading-relaxed">
                現場の「なんとなく大変」という抽象的な課題を、具体的なデータや事象に分析する力。領域を横断して批判的に物事を捉え、当事者ですら気づかない解決策の糸口を見出すことを目指します。
              </p>
            </div>

            {/* Goal 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-earth-100 hover:shadow-xl transition-all duration-500 group">
              <h4 className="text-[10px] font-black text-forest-600 uppercase tracking-widest mb-2">Goal 03</h4>
              <h3 className="text-xl font-bold text-earth-900 mb-4 serif">System Design<br /><span className="text-sm font-sans font-normal text-earth-500">持続可能な設計思考</span></h3>
              <p className="text-sm text-earth-600 leading-relaxed">
                単なる効率化ツールの提供に留まらず、そのソリューションによって生み出される価値を常に意識し、ビジネスモデルと社会調和を見据えた全体設計を重視することを目指します。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Skillset Section */}
      <section id="skills" className="py-24 md:py-32 bg-white border-t border-earth-100 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-[10px] md:text-xs font-black text-earth-400 uppercase tracking-[0.5em] mb-4">Competency & Tools</h2>
            <h3 className="text-3xl md:text-4xl font-bold serif text-earth-900">My skill set</h3>
          </div>

          <div className="flex flex-col items-center">
            {/* 動的なスライディングタブ：モバイル対応 */}
            <div className="relative inline-flex bg-white/60 backdrop-blur-xl p-1 md:p-1.5 rounded-xl md:rounded-[20px] border border-earth-200 shadow-sm mb-12 md:mb-16 max-w-full overflow-x-auto scrollbar-hide">
              <div 
                className="absolute top-1 md:top-1.5 bottom-1 md:bottom-1.5 transition-all duration-700 cubic-bezier(0.65, 0, 0.35, 1) rounded-lg md:rounded-xl shadow-lg"
                style={{
                  left: `${indicatorStyle.left}px`,
                  width: `${indicatorStyle.width}px`,
                  backgroundColor: categoryInfo[activeSkillTab].color,
                  transform: 'scale(0.96)',
                }}
              ></div>
              {skillCategories.map((cat, idx) => (
                <button
                  key={cat}
                  ref={el => { tabRefs.current[idx] = el; }}
                  onClick={() => setActiveSkillTab(cat)}
                  className={`relative z-10 px-4 md:px-10 py-2.5 md:py-3.5 rounded-lg md:rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] transition-colors duration-500 whitespace-nowrap ${
                    activeSkillTab === cat ? 'text-white' : 'text-earth-400 hover:text-earth-600'
                  }`}
                >
                  {categoryInfo[cat].title}
                </button>
              ))}
            </div>

            {/* コンテンツカード：レスポンシブレイアウト */}
            <div className="w-full max-w-5xl bg-earth-50 rounded-3xl md:rounded-[40px] shadow-2xl border border-earth-100 p-6 md:p-16 relative overflow-hidden">
              <div 
                className="absolute inset-0 opacity-[0.03] transition-colors duration-1000 pointer-events-none"
                style={{ backgroundColor: categoryInfo[activeSkillTab].color }}
              ></div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">
                <div className="relative order-2 lg:order-1 flex justify-center w-full">
                   <RadarChart 
                      title={activeSkillTab} 
                      color={categoryInfo[activeSkillTab].color} 
                      skills={filteredSkills.length > 0 ? filteredSkills : [
                          {id:'d1', name:'Core', level:4, category: activeSkillTab},
                          {id:'d2', name:'Tool', level:3, category: activeSkillTab},
                          {id:'d3', name:'Method', level:5, category: activeSkillTab},
                          {id:'d4', name:'Theory', level:4, category: activeSkillTab}
                      ]} 
                   />
                </div>

                <div className="relative order-1 lg:order-2 flex flex-col justify-center">
                  <div key={activeSkillTab} className="animate-fadeIn space-y-6 md:space-y-8">
                    <div>
                      <h4 className="text-[9px] md:text-[10px] font-black text-earth-300 uppercase tracking-[0.3em] mb-3">Focus Area</h4>
                      <h3 className="text-2xl md:text-3xl font-bold serif text-earth-900 mb-4 md:mb-6">
                        {categoryInfo[activeSkillTab].title}
                      </h3>
                      <p className="text-earth-600 leading-relaxed md:leading-loose text-sm md:text-base">
                        {categoryInfo[activeSkillTab].desc}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-[9px] md:text-[10px] font-black text-earth-300 uppercase tracking-[0.3em] border-b border-earth-100 pb-2">Skill Inventory</h4>
                      <div className="flex flex-wrap gap-2">
                        {filteredSkills.map(s => (
                          <div 
                            key={s.id} 
                            className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-1.5 md:py-2 bg-earth-50 rounded-full border border-earth-100 transition-all hover:border-earth-300"
                          >
                            <span className="text-[10px] md:text-xs font-bold text-earth-800">{s.name}</span>
                            <div className="flex gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <div 
                                  key={i} 
                                  className={`w-1 md:w-1.5 h-1 md:h-1.5 rounded-full transition-colors duration-700 ${i < s.level ? '' : 'bg-earth-200'}`}
                                  style={{ backgroundColor: i < s.level ? categoryInfo[activeSkillTab].color : undefined }}
                                ></div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Projects Section */}
      <section id="projects" className="py-24 bg-earth-50 border-t border-earth-100">
        <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-between items-end mb-12">
                <SectionTitle en="Projects" jp="主な取り組み" />
                <Link to="/topics" className="hidden md:inline-block text-forest-700 font-bold hover:underline mb-8">
                    全ての実績を見る →
                </Link>
            </div>
            <div className="mt-10 mb-6 flex justify-end md:hidden">
              <Link to="/topics" className="text-forest-700 font-bold hover:underline">
                全ての実績を見る →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {featuredTopics.map(topic => (
                    <TopicCard key={topic.id} topic={topic} />
                ))}
            </div>
        </div>
      </section>

      {/* 5. News Section */}
      <section id="news" className="py-16 bg-white border-t border-earth-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-start gap-8">
            <div className="md:w-1/4">
               <h3 className="text-xl font-bold serif text-earth-900 border-l-4 border-forest-600 pl-4">NEWS</h3>
            </div>
            <div className="md:w-3/4 space-y-4">
               {latestNews.map(news => (
                 <a key={news.id} href={news.short_text || '#'} className="block group border-b border-earth-100 pb-4">
                    <span className="text-sm font-mono text-earth-400">{news.date}</span>
                    <h4 className="text-lg font-bold text-earth-900 group-hover:text-forest-700">{news.title}</h4>
                 </a>
               ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. Hobbies & Special Experiences (Mini Section) */}
      <section id="experiences-minimal" className="py-32 bg-earth-50 relative overflow-hidden border-t border-earth-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold serif text-earth-900 mb-6">My Experiences</h2>
            <p className="text-earth-500 mb-10 max-w-lg mx-auto leading-loose text-sm italic">
              多様な体験を享受し、多様な価値観、世界に出会うこと。<br />
              それは、自ら現場の課題を発見し、現場に寄り添ったサービスの実装を行うための基盤であると考えています。<br />
              ここでは、これまでに得た多様な経験をまとめています。下記ボタンからご覧ください。
            </p>
            
            <Link 
              to="/experiences" 
              className="inline-flex items-center gap-4 px-10 py-4 bg-earth-900 text-white rounded-full font-bold hover:bg-forest-700 transition-all hover:gap-6 shadow-xl"
            >
              Explore My Experiences
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
        </div>
      </section>

      {/* 7. Contact Section */}
      <section id="contact" className="py-24 bg-white border-t border-earth-100">
        <div className="max-w-3xl mx-auto px-6">
            <SectionTitle en="Contact" jp="お問い合わせ" />
            <div className="bg-white p-6 md:p-12 rounded-2xl border border-earth-100 shadow-xl relative overflow-hidden">
                {sentStatus === 'success' ? (
                  <div className="text-center py-8 animate-fadeIn">
                    <div className="w-20 h-20 bg-forest-50 text-forest-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-earth-900 mb-4 serif">Message Sent!</h3>
                    <p className="text-earth-600 mb-8 leading-relaxed">
                      お問い合わせありがとうございます。メッセージは正常に送信されました。<br />
                      内容を確認の上、折り返しご連絡させていただきます。
                    </p>
                    <button 
                      onClick={resetSentStatus} 
                      className="inline-flex items-center gap-2 text-forest-700 font-bold hover:underline"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      別のメッセージを送る
                    </button>
                  </div>
                ) : (
                  <>
                    <form ref={formRef} onSubmit={sendEmail} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                              <label className="block text-[10px] font-black uppercase tracking-widest text-earth-400 mb-2">お名前 <span className="text-forest-600">*</span></label>
                              <input 
                                type="text" 
                                name="user_name" 
                                required 
                                className="w-full px-4 py-3.5 rounded-lg border border-earth-100 bg-earth-50/50 focus:bg-white focus:ring-2 focus:ring-forest-500/20 focus:border-forest-500 outline-none transition-all" 
                                placeholder="サンプル 太郎"
                              />
                          </div>
                          <div>
                              <label className="block text-[10px] font-black uppercase tracking-widest text-earth-400 mb-2">メールアドレス <span className="text-forest-600">*</span></label>
                              <input 
                                type="email" 
                                name="user_email" 
                                required 
                                className="w-full px-4 py-3.5 rounded-lg border border-earth-100 bg-earth-50/50 focus:bg-white focus:ring-2 focus:ring-forest-500/20 focus:border-forest-500 outline-none transition-all" 
                                placeholder="example@mail.com"
                              />
                          </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-earth-400 mb-2">メッセージ <span className="text-forest-600">*</span></label>
                            <textarea 
                              name="message" 
                              rows={5} 
                              required 
                              className="w-full px-4 py-3.5 rounded-lg border border-earth-100 bg-earth-50/50 focus:bg-white focus:ring-2 focus:ring-forest-500/20 focus:border-forest-500 outline-none transition-all resize-none"
                              placeholder="ご質問やご相談内容をご記入ください"
                            ></textarea>
                        </div>
                        
                        {sentStatus === 'error' && (
                          <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm font-medium animate-fadeIn">
                            エラーが発生しました。時間を置いて再度お試しいただくか、SNS等からご連絡ください。
                          </div>
                        )}

                        <button 
                          type="submit" 
                          disabled={sending} 
                          className={`w-full py-4 rounded-full font-bold text-white transition-all flex items-center justify-center gap-3 shadow-lg ${
                            sending ? 'bg-earth-300 cursor-not-allowed' : 'bg-forest-600 hover:bg-forest-700 hover:shadow-xl'
                          }`}
                        >
                            {sending ? (
                              <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                送信中...
                              </>
                            ) : 'メッセージを送信する'}
                        </button>
                    </form>
                    <p className="text-[10px] text-earth-400 text-center mt-6 tracking-widest uppercase">
                      Usually replies within 2-3 business days.
                    </p>
                  </>
                )}
            </div>
        </div>
      </section>
    </Layout>
  );
};
