
import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { TopicCard } from '../components/TopicCard';
import { supabase } from '../services/supabase';
import { Topic, Category } from '../types';

export const TopicsList: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [filter, setFilter] = useState<Category | 'all'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopics = async () => {
      setLoading(true);
      let query = supabase.from('topics').select('*').order('created_at', { ascending: false });
      
      if (filter !== 'all') {
        query = query.eq('category', filter);
      }

      const { data, error } = await query;
      
      if (data) {
        setTopics(data);
      } else {
         // Fallback for demo
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
              },
              {
                  id: '3', title: '高専デザインコンペティション2023 発表資料', category: 'Works', slug: 'design-compe-2023',
                  summary: '「地域と共生するテクノロジー」をテーマにしたプレゼンテーション資料。', tags: ['Design', 'Presentation'],
                  created_at: new Date().toISOString()
              },
               {
                  id: '4', title: '猟友会フィールドワーク記録', category: 'Others', slug: 'fieldwork-log',
                  summary: '3ヶ月にわたる見回り同行調査の行動ログと気付き。', tags: ['Fieldwork', 'Research'],
                  created_at: new Date().toISOString()
              }
         ]);
      }
      setLoading(false);
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

          {/* Filter */}
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

          {/* Grid */}
          {loading ? (
            <div className="text-center py-20 text-earth-500">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {topics.map((topic) => (
                <TopicCard key={topic.id} topic={topic} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
