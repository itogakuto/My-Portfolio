
import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { TopicCard } from '../components/TopicCard';
import { supabase } from '../services/supabase';
import { Topic, Category } from '../types';

export const TopicsList: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [filter, setFilter] = useState<Category | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [errorOccurred, setErrorOccurred] = useState(false);

  useEffect(() => {
    const fetchTopics = async () => {
      setLoading(true);
      setErrorOccurred(false);
      
      try {
        // sort_order 昇順を第一優先
        let query = supabase.from('topics').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: false });
        
        if (filter !== 'all') {
          query = query.eq('category', filter);
        }

        const { data, error } = await query;
        if (error) throw error;
        if (data) setTopics(data);
      } catch (err) {
        console.error('Fetch error:', err);
        setErrorOccurred(true);
        setTopics([
             {
                  id: '1', title: '自動罠作動時通知システム「TrapNote」', category: 'Projects', slug: 'trap-note',
                  summary: 'LoRaWANを活用した低コスト通知システム。', tags: ['IoT', 'LoRaWAN'],
                  created_at: new Date().toISOString()
              },
              {
                  id: '2', title: '獣害状況の可視化マッピング', category: 'Projects', slug: 'mapping',
                  summary: '住民目撃情報のヒートマップ化。', tags: ['GIS'],
                  created_at: new Date().toISOString()
              }
         ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, [filter]);

  const categories: { key: Category | 'all'; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'Projects', label: 'Projects' },
    { key: 'Works', label: 'Works' },
    { key: 'Others', label: 'Others' },
  ];

  return (
    <Layout>
      <div className="pt-32 pb-24 bg-earth-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold serif text-earth-900 mb-4">Projects & Activities</h1>
            <p className="text-earth-600">課題設定から社会実装まで、これまでの軌跡。</p>
          </div>

          <div className="flex justify-center gap-4 mb-12 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setFilter(cat.key)}
                className={`px-6 py-2 rounded-full font-bold transition-all ${
                  filter === cat.key
                    ? 'bg-forest-600 text-white shadow-lg'
                    : 'bg-white text-earth-600 border border-earth-200 hover:bg-earth-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-20 text-earth-500">Loading...</div>
          ) : (
            <>
              {topics.length === 0 ? (
                <div className="text-center py-20">
                   <p className="text-earth-400 mb-4">プロジェクトがまだ登録されていません。</p>
                   <p className="text-xs text-earth-300 italic">Admin画面からデータを追加してください。</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {topics.map((topic) => (
                    <TopicCard key={topic.id} topic={topic} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};
