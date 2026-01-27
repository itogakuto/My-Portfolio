export type Category = 'Projects' | 'Works' | 'Others';
export type SkillCategory = 'On-sight' | 'Technology' | 'Business';

export interface Topic {
  id: string;
  title: string;
  slug: string;
  category: Category;
  summary: string;
  body?: string;
  tags: string[];
  role?: string;
  links?: any;
  image_url?: string;
  sort_order?: number; // Added
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
  sort_order?: number; // Added
  status?: string;
  created_at: string;
}

export interface Skill {
  id: string;
  category: SkillCategory;
  name: string;
  level: number;
  sort_order?: number; // Added
}

export interface Experience {
  id: string;
  title: string;
  slug: string;
  summary: string;
  body?: string;
  image_url?: string;
  sort_order?: number; // Added
  created_at: string;
}

export interface User {
  id: string;
  email: string;
}
