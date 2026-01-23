import React from 'react';

interface Props {
  en: string;
  jp: string;
  color?: 'dark' | 'light';
}

export const SectionTitle: React.FC<Props> = ({ en, jp, color = 'dark' }) => (
  <div className="mb-12 md:mb-16">
    <h2 className={`text-3xl md:text-4xl font-bold serif mb-3 ${color === 'dark' ? 'text-earth-900' : 'text-white'}`}>
      {en}
    </h2>
    <div className={`h-1 w-12 ${color === 'dark' ? 'bg-forest-600' : 'bg-white'} mb-3`}></div>
    <p className={`text-sm tracking-widest font-medium ${color === 'dark' ? 'text-earth-500' : 'text-earth-200'}`}>
      {jp}
    </p>
  </div>
);