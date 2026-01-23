export type Category = 'Projects' | 'Works' | 'Others';
export type SkillCategory = 'Technology' | 'Design' | 'Entrepreneurship';

export interface Topic {
  id: string;
  title: string;
  slug: string; // Required as per DB schema
  category: Category;
  summary: string;
  body?: string; // Markdown or plain text
  tags: string[];
  role?: string;
  links?: any; // JSONB
  image_url?: string;
  created_at: string;
  updated_at?: string;
  status?: string;
}

export interface News {
  id: string;
  title: string;
  category?: string;
  short_text?: string;
  body?: string;
  date?: string;
  status?: string;
  created_at: string;
}

export interface Skill {
  id: string;
  category: SkillCategory;
  name: string;
  level: number;
}

export interface User {
  id: string;
  email: string;
}