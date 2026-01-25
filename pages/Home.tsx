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
  
  const [heroImages, setHeroImages] = useState<string[]>([
    "https://picsum.photos/1920/1080?grayscale&blur=2",
    "https://images.unsplash.com/photo-1444858291040-58f756a3bdd6?q=80&w=2078&auto=format&fit=crop"
  ]);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  const formRef = useRef<HTMLFormElement>(null);
  const [sending, setSending] = useState(false);
  const [sentStatus, setSentStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    const fetchData = async () => {
      const { data: images } = await supabase.from('hero_images').select('image_url');
      if (images && images.length > 0) {
        setHeroImages(images.map(img => img.image_url));
      }

      const { data: topics } = await supabase.from('topics').select('*').limit(3);
      const { data: news } = await supabase.from('news').select('*').order('created_at', { ascending: false }).limit(3);
      const { data: skillsData } = await supabase.from('skills').select('*');

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

  const filteredSkills = skills.filter(s => s.category === activeSkillTab);

  const categoryInfo: Record<SkillCategory, { title: string, color: string, desc: string, levels: string[] }> = {
    'Technology': {
      title: 'テクノロジー',
      color: '#f87171',
      desc: 'フロントエンドからバックエンド、さらにはIoTデバイスの製作まで、現場の課題を解決するための実装力を磨いています。特に現場での運用に耐えうる堅牢なシステム構築を重視しています。',
      levels: ["5 - Super Saiyan", "4 - Ninja", "3 - Pokémon Master", "2 - I can use it a little.", "1 - Beginner"]
    },
    'Design': {
      title: 'デザイン',
      color: '#34d399',
      desc: '単なる美しさだけでなく、ユーザー体験（UX）に基づいた設計を心がけています。狩猟現場での使いやすさや、情報の伝わりやすさをエンジニアリングの視点と融合させています。',
      levels: ["5 - Jedi", "4 - Samurai", "3 - Stand Master", "2 - I can use it a little.", "1 - Beginner"]
    },
    'Entrepreneurship': {
      title: '起業家精神',
      color: '#fbbf24',
      desc: 'フィールドワークを通じて課題の本質を捉え、それを解決するためのビジネスモデルや戦略を立案します。地域社会とのコミュニケーションを大切にし、持続可能な産業構造の構築を目指します。',
      levels: ["5 - Platinum", "4 - Gold", "3 - Silver", "2 - Bronze", "1 - Beginner"]
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
            <p className="text-forest-200 font-bold tracking-widest mb-6 uppercase text-sm animate-fadeIn">Agriculture x Technology</p>
            <h1 className="text-4xl md:text-7xl font-bold serif mb-6 leading-tight text-white drop-shadow-md animate-fadeIn" style={{ animationDelay: '0.2s' }}>
              狩猟<span className="text-[0.9em] align-baseline mx-0.5 opacity-90 font-normal">を</span>経済<span className="text-[0.9em] align-baseline mx-0.5 opacity-90 font-normal">で</span>持続可能に。
            </h1>
          </div>
        </div>
      </section>

      {/* 1. Profile Section */}
      <section id="profile" className="py-24 bg-earth-50 relative overflow-hidden">
        <DeerLineArt className="absolute top-10 right-[-50px] w-64 h-64 text-forest-200 pointer-events-none" opacity={0.15} />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
            <SectionTitle en="Profile" jp="私について" />
            <div className="flex flex-col md:flex-row items-start gap-12">
                <div className="w-full md:w-1/3">
                    <div className="aspect-[3/4] rounded-lg overflow-hidden shadow-xl bg-earth-200">
                        <img src="https://picsum.photos/600/800" alt="Ito Gakuto" className="w-full h-full object-cover" />
                    </div>
                </div>
                <div className="w-full md:w-2/3">
                    <h3 className="text-3xl font-bold serif text-earth-900 mb-2">伊藤 楽大 <span className="text-xl font-sans font-normal text-earth-500 ml-2">Ito Gakuto</span></h3>
                    <p className="text-forest-700 font-bold mb-6 text-lg">神山まるごと高等専門学校 デザイン・エンジニアリング学科</p>
                    <div className="prose prose-earth text-earth-700 leading-loose">
                        <p>現場の課題をエンジニアリングに翻訳し、実際に使える形に落とし込む。そして、将来は狩猟を「資源生産」という前向きな産業へと転換することを目指しています。</p>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* 2. My Purpose Section */}
      <section id="purpose" className="py-24 bg-white relative overflow-hidden">
        <BoarLineArt className="absolute bottom-[-40px] left-[-40px] w-80 h-80 text-earth-100 pointer-events-none -rotate-12" opacity={0.1} />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <SectionTitle en="My Purpose" jp="私の志" />
          
          <div className="mt-12">
            <h3 className="text-2xl md:text-4xl font-bold serif text-earth-900 mb-10 leading-relaxed text-center md:text-left">
              「害獣駆除」を、<br className="md:hidden" />価値ある「資源生産」へ。
            </h3>
            
            <div className="prose prose-lg prose-earth text-earth-700 leading-loose space-y-8 max-w-3xl">
              <p>
                現在、日本の農村部で起きている「鳥獣被害」は、単なる野生動物の問題ではなく、地域コミュニティの維持や食料自給、そこで生態系のバランスに関わる複合的な課題です。
              </p>
              <p>
                私は、テクノロジーを活用した効率的な捕獲管理と、捕獲個体を無駄にしない経済循環の仕組みをデザインすることで、狩猟を「ボランティアベースの駆除」から「持続可能な産業」へとアップデートしたいと考えています。
              </p>
              <p className="font-bold text-forest-700 text-xl border-l-4 border-forest-600 pl-6 py-2">
                エンジニアリングの力で、現場の苦労を希望に変える。<br className="hidden md:inline" />それが私の目指す未来です。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Skillset Section */}
      <section id="skills" className="py-24 bg-earth-50 border-t border-earth-100">
        <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
                <h2 className="text-4xl font-bold serif text-earth-900 mb-8">My skill set</h2>
                <div className="max-w-3xl mx-auto mb-12 text-earth-600 leading-relaxed text-sm">
                    <p>修練のすえ身につけたスキルをグラフィカルにまとめました。フロントからバックエンド、さらには現場での起業家精神まで幅広く取り組んでいます。</p>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap justify-center gap-4 mb-16">
                    {(['Technology', 'Design', 'Entrepreneurship'] as SkillCategory[]).map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveSkillTab(cat)}
                            className={`px-8 py-3 rounded-full font-bold transition-all duration-300 border-2 ${
                                activeSkillTab === cat 
                                ? 'bg-earth-900 text-white border-earth-900 shadow-lg' 
                                : 'bg-white text-earth-400 border-earth-100 hover:border-earth-300'
                            }`}
                        >
                            {categoryInfo[cat].title}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content centered container */}
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-center gap-12 md:gap-20 min-h-[450px]">
                {/* Left: Chart - Centered in its half */}
                <div className="w-full md:w-1/2 flex justify-center animate-fadeIn">
                    <div className="bg-white p-8 md:p-12 rounded-3xl border border-earth-100 shadow-sm transition-all duration-500 hover:shadow-md">
                        <RadarChart 
                            title={activeSkillTab} 
                            color={categoryInfo[activeSkillTab].color} 
                            skills={filteredSkills.length > 0 ? filteredSkills : [
                                {id:'d1', name:'HTML/CSS', level:4, category: activeSkillTab},
                                {id:'d2', name:'JS', level:3, category: activeSkillTab},
                                {id:'d3', name:'Python', level:5, category: activeSkillTab},
                                {id:'d4', name:'IoT', level:4, category: activeSkillTab}
                            ]} 
                        />
                    </div>
                </div>

                {/* Right: Textual Explanation - Balanced and Centered horizontally */}
                <div className="w-full md:w-1/2 text-left space-y-8 animate-slideInRight px-4 md:px-0">
                    <div>
                        <h3 className="text-2xl font-bold serif text-earth-900 mb-4 flex items-center gap-3">
                            <span className="w-8 h-1 rounded-full" style={{ backgroundColor: categoryInfo[activeSkillTab].color }}></span>
                            {categoryInfo[activeSkillTab].title}について
                        </h3>
                        <p className="text-earth-600 leading-loose text-sm md:text-base">
                            {categoryInfo[activeSkillTab].desc}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="bg-white p-5 rounded-xl border border-earth-100 shadow-sm">
                            <h4 className="text-[10px] font-black text-earth-400 uppercase tracking-[0.2em] mb-4">主要スタック</h4>
                            <ul className="space-y-3">
                                {filteredSkills.length > 0 ? filteredSkills.map(skill => (
                                    <li key={skill.id} className="flex justify-between items-center text-sm border-b border-earth-50 pb-2">
                                        <span className="font-bold text-earth-700">{skill.name}</span>
                                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-earth-100 text-earth-500">Lv.{skill.level}</span>
                                    </li>
                                )) : <li className="text-xs text-earth-400 italic">No skills added yet</li>}
                            </ul>
                        </div>
                        <div className="bg-earth-50/50 p-5 rounded-xl border border-earth-50">
                            <h4 className="text-[10px] font-black text-earth-400 uppercase tracking-[0.2em] mb-4">習熟度スコア</h4>
                            <ul className="space-y-1.5">
                                {categoryInfo[activeSkillTab].levels.map((l, i) => (
                                    <li key={i} className="text-[10px] text-earth-400 leading-tight">{l}</li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <p className="text-[10px] text-forest-600 font-bold bg-forest-50 px-4 py-2 rounded-full inline-block border border-forest-100">
                        ＊実務やプロジェクトでの実体験に基づき算出しています
                    </p>
                </div>
            </div>
        </div>
      </section>

      {/* 4. Projects Section */}
      <section id="projects" className="py-24 bg-white border-t border-earth-100">
        <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-between items-end mb-12">
                <SectionTitle en="Projects" jp="主な取り組み" />
                <Link to="/topics" className="hidden md:inline-block text-forest-700 font-bold hover:underline mb-16">
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
      <section id="news" className="py-16 bg-earth-50 border-t border-earth-100">
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

      {/* 7. Hobbies & Special Experiences (Mini Section) */}
      <section id="experiences-minimal" className="py-32 bg-white relative overflow-hidden border-t border-earth-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="relative inline-block mb-12 group">
              {/* Fade Container */}
              <div className="relative w-48 h-48 mx-auto">
                <DeerLineArt className="absolute inset-0 w-full h-full text-earth-200 transition-opacity duration-700 group-hover:opacity-0" opacity={0.3} />
                <div className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-full overflow-hidden border-2 border-forest-100">
                   <img src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1000&auto=format&fit=crop" alt="Nature" className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000" />
                </div>
              </div>
            </div>
            
            <h2 className="text-3xl font-bold serif text-earth-900 mb-6">Diversified Background</h2>
            <p className="text-earth-500 mb-10 max-w-lg mx-auto leading-loose text-sm italic">
              狩猟だけでなく、多様なフィールドでの面白い体験や、<br />
              少し変わった趣味・経験が、私の思考のスパイスになっています。
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

      {/* 6. Contact Section */}
      <section id="contact" className="py-24 bg-earth-50 border-t border-earth-100">
        <div className="max-w-3xl mx-auto px-6">
            <SectionTitle en="Contact" jp="お問い合わせ" />
            <div className="bg-white p-8 rounded-xl border border-earth-100 shadow-sm">
                <form ref={formRef} onSubmit={sendEmail} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-earth-800 mb-2">お名前</label>
                        <input type="text" name="user_name" required className="w-full px-4 py-3 rounded border border-earth-200" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-earth-800 mb-2">メールアドレス</label>
                        <input type="email" name="user_email" required className="w-full px-4 py-3 rounded border border-earth-200" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-earth-800 mb-2">メッセージ</label>
                        <textarea name="message" rows={5} required className="w-full px-4 py-3 rounded border border-earth-200"></textarea>
                    </div>
                    <button type="submit" disabled={sending} className="w-full py-4 rounded-full font-bold text-white bg-forest-600 hover:bg-forest-700 transition-colors">
                        {sending ? '送信中...' : 'メッセージを送信する'}
                    </button>
                </form>
            </div>
        </div>
      </section>
    </Layout>
  );
};