import React from 'react';
import { Link } from 'react-router-dom';
import { Topic } from '../types';

interface Props {
  topic: Topic;
}

export const TopicCard: React.FC<Props> = ({ topic }) => {
  return (
    <Link to={`/topics/${topic.slug}`} className="group block h-full">
      <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-earth-100 flex flex-col h-full">
        <div className="aspect-video w-full overflow-hidden bg-earth-200 relative">
          <img 
            src={topic.image_url || `https://picsum.photos/seed/${topic.id}/800/450`} 
            alt={topic.title}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
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
                 {new Date(topic.created_at).toLocaleDateString()}
               </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};