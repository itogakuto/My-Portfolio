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
    "images/hero-images/1.jpg"
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
      levels: ["5 - Super", "4 - Always", "3 - Often", "2 - Sometimes", "1 - Beginner"]
    },
    'Design': {
      title: 'デザイン',
      color: '#34d399',
      desc: '単なる美しさだけでなく、ユーザー体験（UX）に基づいた設計を心がけています。狩猟現場での使いやすさや、情報の伝わりやすさをエンジニアリングの視点と融合させています。',
      levels: ["5 - Super", "4 - Always", "3 - Often", "2 - Sometimes", "1 - Beginner"]
    },
    'Entrepreneurship': {
      title: '起業家精神',
      color: '#fbbf24',
      desc: 'フィールドワークを通じて課題の本質を捉え、それを解決するためのビジネスモデルや戦略を立案します。地域社会とのコミュニケーションを大切にし、持続可能な産業構造の構築を目指します。',
      levels: ["5 - Super", "4 - Always", "3 - Often", "2 - Sometimes", "1 - Beginner"]
    }
  };

  const skillCategories: SkillCategory[] = ['Technology', 'Design', 'Entrepreneurship'];

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
              多分野を横断する技術と経験で、世界を変えていく"最強の右腕"を目指して。
            </p>
          </div>
        </div>
      </section>

      {/* 1. Profile Section */}
      <section id="profile" className="py-24 bg-earth-50 relative overflow-hidden">
        <DeerLineArt className="absolute top-3 right-[50px] w-80 h-80 text-forest-200 pointer-events-none object-contain" opacity={1} />
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
                    <p className="text-forest-700 font-bold mb-6 text-lg">神山まるごと高等専門学校 デザイン・エンジニアリング学科</p>
                    <div className="prose prose-earth text-earth-700 leading-loose">
                        <p>
                          情報工学を専門とし、web開発やアプリ開発を中心に据え、新規事業開発や主催イベントの開催など、幅広く活動を行ってきました。 いずれの活動においても主体性を発揮し、それぞれの理想的な結果の実現に貢献してきました。 また、農業や狩猟などに関する知見もあり、多分野を横断した多角的な思考および現場の声に則したプロダクト開発を行う点も私の強みです。
                        </p>
                        <p><br />
                          現在は編入学に向けて準備を進めつつ、技術力の向上を目指しています。
                        </p>
                        <p>
                          これまでさまざまな活動をしてきたものの、その力はまだまだ不十分だと感じています。
                        </p>
                        <p><br />
                          今後、企業様へのインターンシップや進学後の研究活動等において、さらなる技術力の向上を目指し、多分野に知見を持つ技術的素養を持った人材として、現場主体の課題解決を通じて社会に貢献していきたいと考えています。
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
              あなたの世界をより楽しくより大きく<br />
            </h3>
            
            <div className="prose prose-lg prose-earth text-earth-700 leading-loose space-y-8 max-w-3xl">
              <p>
                笑顔でいること<br />
                楽しむこと<br />
                成長すること<br /><br />
                
                それだけで、世界は少しずつよりよくなるのではないかと考えています。<br /><br />

                まずは目の前のあなたを、技術や経験、ビジネスの力で支え、あなたの世界をより楽しくより大きくすること。<br />
                それが私の志です。<br /><br />


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

      {/* 3. Skillset Section - COMPLETELY REFRESHED LAYOUT */}
      <section id="skills" className="py-32 bg-earth-50 border-t border-earth-100 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <h3 className="text-4xl font-bold serif text-earth-900">My skill set</h3>
          </div>

          <div className="flex flex-col items-center">
            {/* Elegant Tab System */}
            <div className="relative inline-flex bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-earth-200 shadow-sm mb-16 overflow-hidden">
              <div 
                className="absolute top-1.5 bottom-1.5 transition-all duration-700 cubic-bezier(0.65, 0, 0.35, 1) rounded-xl shadow-lg"
                style={{
                  left: `${(skillCategories.indexOf(activeSkillTab) / skillCategories.length) * 100}%`,
                  width: `${100 / skillCategories.length}%`,
                  backgroundColor: categoryInfo[activeSkillTab].color
                }}
              ></div>
              {skillCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveSkillTab(cat)}
                  className={`relative z-10 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-colors duration-500 whitespace-nowrap ${
                    activeSkillTab === cat ? 'text-white' : 'text-earth-400 hover:text-earth-600'
                  }`}
                >
                  {categoryInfo[cat].title}
                </button>
              ))}
            </div>

            {/* Content Container with Unified Transition */}
            <div className="w-full max-w-5xl bg-white rounded-[40px] shadow-2xl border border-earth-100 p-8 md:p-16 relative overflow-hidden">
              {/* Subtle Ambient Color Bloom */}
              <div 
                className="absolute inset-0 opacity-[0.02] transition-colors duration-1000"
                style={{ backgroundColor: categoryInfo[activeSkillTab].color }}
              ></div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Left: Morphing Radar Chart */}
                <div className="relative order-2 lg:order-1 flex justify-center">
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

                {/* Right: Cross-fading Description */}
                <div className="relative order-1 lg:order-2 h-full min-h-[300px] flex flex-col justify-center">
                  <div key={activeSkillTab} className="animate-fadeIn space-y-8">
                    <div>
                      <h4 className="text-[10px] font-black text-earth-300 uppercase tracking-[0.3em] mb-4">Focus Area</h4>
                      <h3 className="text-3xl font-bold serif text-earth-900 mb-6">
                        {categoryInfo[activeSkillTab].title}
                      </h3>
                      <p className="text-earth-600 leading-loose text-base">
                        {categoryInfo[activeSkillTab].desc}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-earth-300 uppercase tracking-[0.3em] border-b border-earth-100 pb-2">Skill Inventory</h4>
                      <div className="flex flex-wrap gap-2">
                        {filteredSkills.map(s => (
                          <div 
                            key={s.id} 
                            className="flex items-center gap-3 px-4 py-2 bg-earth-50 rounded-full border border-earth-100 transition-all hover:border-earth-300"
                          >
                            <span className="text-xs font-bold text-earth-800">{s.name}</span>
                            <div className="flex gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <div 
                                  key={i} 
                                  className={`w-1.5 h-1.5 rounded-full transition-colors duration-700 ${i < s.level ? '' : 'bg-earth-200'}`}
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

      {/* 6. Hobbies & Special Experiences (Mini Section) */}
      <section id="experiences-minimal" className="py-32 bg-white relative overflow-hidden border-t border-earth-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold serif text-earth-900 mb-6">My Experiences</h2>
            <p className="text-earth-500 mb-10 max-w-lg mx-auto leading-loose text-sm italic">
              世界を楽しみ、学び、大きくなること。それは、僕の活動のテーマの一つです。<br />
              これまでに得た多様な経験をまとめています。下記ボタンからご覧ください。
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
      <section id="contact" className="py-24 bg-earth-50 border-t border-earth-100">
        <div className="max-w-3xl mx-auto px-6">
            <SectionTitle en="Contact" jp="少しでもご興味をお持ちいただけましたら、下記よりお問い合わせいただきますようにお願いします。" />
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