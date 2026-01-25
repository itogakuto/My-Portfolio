import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Layout } from '../components/Layout';
import { Topic } from '../types';
import { resolveImageUrl } from '../components/TopicCard';

export const TopicDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopic = async () => {
      if (!slug) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (data) {
        setTopic(data);
      }
      setLoading(false);
    };

    fetchTopic();
  }, [slug]);

  if (loading) {
    return (
      <Layout>
        <div className="pt-40 pb-20 text-center text-earth-400">Loading...</div>
      </Layout>
    );
  }

  if (!topic) {
    return (
      <Layout>
        <div className="pt-40 pb-20 text-center">
          <h2 className="text-2xl font-bold text-earth-900 mb-4">Project Not Found</h2>
          <Link to="/topics" className="text-forest-600 hover:underline">Back to Projects</Link>
        </div>
      </Layout>
    );
  }

  const displayImage = resolveImageUrl(topic.image_url, topic.id);

  return (
    <Layout>
      <div className="pt-32 pb-24 bg-earth-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-6">
          <Link to="/topics" className="text-sm font-bold text-forest-600 hover:underline mb-8 inline-block">
            ← PROJECTS 一覧に戻る
          </Link>

          <article className="bg-white rounded-2xl overflow-hidden shadow-sm border border-earth-100 animate-fadeIn">
            <div className="aspect-[21/9] w-full bg-earth-200 overflow-hidden">
              <img 
                src={displayImage} 
                alt={topic.title} 
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  const fallback = `https://picsum.photos/seed/${topic.id}/1200/600`;
                  if (target.src !== fallback) {
                    target.src = fallback;
                  }
                }}
                className="w-full h-full object-cover" 
              />
            </div>
            
            <div className="p-8 md:p-12">
              <div className="flex flex-wrap gap-2 mb-8">
                <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] rounded-full text-white shadow-sm ${
                  topic.category === 'Projects' ? 'bg-forest-600' : topic.category === 'Works' ? 'bg-earth-600' : 'bg-stone-500'
                }`}>
                  {topic.category}
                </span>
                {topic.tags && topic.tags.map(tag => (
                  <span key={tag} className="text-[11px] font-bold px-3 py-1.5 bg-earth-100 text-earth-800 rounded-md border border-earth-200">
                    #{tag}
                  </span>
                ))}
              </div>

              <h1 className="text-3xl md:text-5xl font-bold serif text-earth-900 mb-6 leading-tight">
                {topic.title}
              </h1>

              {topic.role && (
                <div className="mb-8 p-4 bg-earth-50 border-l-4 border-forest-500 rounded-r">
                   <p className="text-xs font-black text-earth-400 uppercase tracking-widest mb-1">My Role</p>
                   <p className="text-earth-900 font-bold">{topic.role}</p>
                </div>
              )}

              <div className="prose prose-earth max-w-none text-earth-700 leading-relaxed space-y-6">
                <p className="text-xl text-earth-500 font-medium border-b border-earth-100 pb-6 italic">
                  {topic.summary}
                </p>
                
                <div className="whitespace-pre-wrap py-4 text-earth-800">
                  {topic.body || "本文は準備中です。"}
                </div>
              </div>

              <div className="mt-16 pt-8 border-t border-earth-100 flex justify-between items-center text-xs text-earth-400">
                <span>作成日: {new Date(topic.created_at).toLocaleDateString()}</span>
                {topic.updated_at && <span>更新日: {new Date(topic.updated_at).toLocaleDateString()}</span>}
              </div>
            </div>
          </article>
          
          <div className="mt-12 text-center">
             <Link to="/topics" className="inline-block px-12 py-4 bg-earth-900 text-white rounded-full font-bold hover:bg-forest-700 transition-all shadow-lg">
                他のプロジェクトも見る
             </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};