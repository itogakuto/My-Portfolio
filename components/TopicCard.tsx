import React from 'react';
import { Link } from 'react-router-dom';
import { Topic } from '../types';
import { CONFIG } from '../config';

interface Props {
  topic: Topic;
}

/**
 * 画像パスを解決する共通関数（他のコンポーネントでも使いやすいようにエクスポート可能に検討）
 */
export const resolveImageUrl = (url: string | undefined, id: string): string => {
  const fallback = `https://picsum.photos/seed/${id}/800/450`;
  if (!url || url.trim() === '') return fallback;
  if (url.startsWith('http')) return url;
  
  // 先頭のスラッシュを除去し、バケット名(images)以降のパスを組み立て
  const cleanPath = url.replace(/^\/+/, '');
  return `${CONFIG.SUPABASE.URL}/storage/v1/object/public/images/${cleanPath}`;
};

export const TopicCard: React.FC<Props> = ({ topic }) => {
  const displayImage = resolveImageUrl(topic.image_url, topic.id);

  return (
    <Link to={`/topics/${topic.slug}`} className="group block h-full">
      <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-earth-100 flex flex-col h-full">
        <div className="aspect-video w-full overflow-hidden bg-earth-200 relative">
          <img 
            src={displayImage} 
            alt={topic.title}
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (target.src !== `https://picsum.photos/seed/${topic.id}/800/450`) {
                target.src = `https://picsum.photos/seed/${topic.id}/800/450`;
              }
            }}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute top-4 left-4">
              <span className={`
                px-3 py-1 text-[10px] font-black uppercase tracking-[0.15em] rounded-full text-white shadow-sm
                ${topic.category === 'Projects' ? 'bg-forest-600' : topic.category === 'Works' ? 'bg-earth-600' : 'bg-stone-500'}
              `}>
                {topic.category}
              </span>
          </div>
        </div>
        <div className="p-6 flex flex-col flex-grow">
          <div className="flex-grow">
            <h3 className="text-xl font-bold text-earth-900 mb-3 line-clamp-2 group-hover:text-forest-700 transition-colors serif">
              {topic.title}
            </h3>
            <p className="text-earth-600 text-sm leading-relaxed mb-4 line-clamp-3">
              {topic.summary}
            </p>
          </div>
          
          <div className="mt-4 pt-4 border-t border-earth-50">
            <div className="flex flex-wrap gap-2 mb-4">
              {topic.tags && topic.tags.map(tag => (
                <span 
                  key={tag} 
                  className="text-[11px] font-bold px-3 py-1.5 rounded-md bg-earth-100 text-earth-800 border border-earth-200 transition-colors duration-300"
                >
                  #{tag}
                </span>
              ))}
            </div>
            <div className="flex justify-between items-center">
               <span className="text-[10px] text-forest-600 font-bold uppercase tracking-widest">Read More →</span>
               <span className="text-[10px] text-earth-300 font-mono italic">
                 {topic.created_at ? new Date(topic.created_at).toLocaleDateString() : '---'}
               </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};