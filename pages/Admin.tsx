import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Topic, News, Category, Skill, SkillCategory } from '../types';

export const Admin: React.FC = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<'topics' | 'news' | 'skills'>('topics');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  
  const [isCreating, setIsCreating] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  // Forms state
  const [topicForm, setTopicForm] = useState<Partial<Topic>>({ 
    category: 'Projects', 
    tags: [], 
    title: '', 
    slug: '',
    summary: '', 
    body: '',
    role: '',
    image_url: '' 
  });
  const [newsForm, setNewsForm] = useState<Partial<News>>({ title: '', short_text: '', date: new Date().toISOString().split('T')[0] });
  const [skillForm, setSkillForm] = useState<Partial<Skill>>({ category: 'Technology', level: 3, name: '' });
  
  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Input raw value for tags to handle the typing experience better
  const [tagInputValue, setTagInputValue] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchData();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchData();
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchData = async () => {
    setLoadingData(true);
    const { data: topicsData } = await supabase.from('topics').select('*').order('created_at', { ascending: false });
    if (topicsData) setTopics(topicsData);

    const { data: newsData } = await supabase.from('news').select('*').order('created_at', { ascending: false });
    if (newsData) setNews(newsData);

    const { data: skillsData } = await supabase.from('skills').select('*').order('category', { ascending: true });
    if (skillsData) setSkills(skillsData);

    setLoadingData(false);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error: any) {
        alert("ログインに失敗しました: " + error.message);
    } finally {
        setAuthLoading(false);
    }
  };

  const resetForms = () => {
      setIsCreating(false);
      setEditId(null);
      setSelectedFile(null);
      setUploadPreview(null);
      setTagInputValue('');
      setTopicForm({ 
        category: 'Projects', 
        tags: [], 
        title: '', 
        slug: '',
        summary: '', 
        body: '',
        role: '',
        image_url: '' 
      });
      setNewsForm({ title: '', short_text: '', date: new Date().toISOString().split('T')[0] });
      setSkillForm({ category: 'Technology', level: 3, name: '' });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setSelectedFile(file);
          setUploadPreview(URL.createObjectURL(file));
      }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, file);

      if (uploadError) {
          throw new Error('画像のアップロードに失敗しました: ' + uploadError.message);
      }

      const { data } = supabase.storage.from('images').getPublicUrl(filePath);
      return data.publicUrl;
  };

  const handleEdit = (item: any) => {
      setEditId(item.id);
      if (activeTab === 'topics') {
          setTopicForm(item);
          setTagInputValue(item.tags?.join('、') || '');
          setUploadPreview(item.image_url || null);
      }
      if (activeTab === 'news') setNewsForm(item);
      if (activeTab === 'skills') setSkillForm(item);
      setIsCreating(true);
  };

  const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      setSaving(true);
      
      try {
          let table = '';
          let data: any = {};
          
          if (activeTab === 'topics') {
              table = 'topics';
              
              const finalSlug = topicForm.slug || topicForm.title?.toLowerCase()
                  .replace(/[^a-z0-9ー\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]+/g, '-')
                  .replace(/^-+|-+$/g, '') || `topic-${Date.now()}`;

              let finalImageUrl = topicForm.image_url;
              if (selectedFile) {
                  const uploadedUrl = await uploadImage(selectedFile);
                  if (uploadedUrl) finalImageUrl = uploadedUrl;
              }

              data = { 
                ...topicForm, 
                slug: finalSlug, 
                image_url: finalImageUrl,
                status: 'published'
              };
          } else if (activeTab === 'news') {
              table = 'news';
              data = newsForm;
          } else {
              table = 'skills';
              data = skillForm;
          }

          if (editId) {
              const { error } = await supabase.from(table).update(data).eq('id', editId);
              if (error) throw error;
          } else {
              const { error } = await supabase.from(table).insert([data]);
              if (error) throw error;
          }
          resetForms();
          fetchData();
      } catch (error: any) {
          console.error(error);
          alert("保存に失敗しました: " + (error.message || JSON.stringify(error)));
      } finally {
          setSaving(false);
      }
  };

  const handleDelete = async (table: string, id: string) => {
      if(!window.confirm('このデータを削除してもよろしいですか？')) return;
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) alert("削除に失敗しました: " + error.message);
      fetchData();
  };

  // Tag splitting logic
  const handleTagChange = (value: string) => {
    setTagInputValue(value);
    // Split by both half-width comma and full-width ideographic comma (Japanese)
    const tags = value.split(/[、,，]+/).map(s => s.trim()).filter(s => s);
    setTopicForm({ ...topicForm, tags });
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-earth-100 px-6">
        <form onSubmit={handleAuth} className="bg-white p-8 rounded shadow-lg w-full max-w-sm">
          <h2 className="text-xl font-bold mb-6 text-earth-900 serif">Admin Login</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-earth-500 mb-1 uppercase tracking-wider">Email</label>
              <input type="email" placeholder="Email" className="w-full p-3 border border-earth-200 rounded text-sm focus:ring-2 focus:ring-forest-500 outline-none" value={email} onChange={e=>setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-bold text-earth-500 mb-1 uppercase tracking-wider">Password</label>
              <input type="password" placeholder="Password" className="w-full p-3 border border-earth-200 rounded text-sm focus:ring-2 focus:ring-forest-500 outline-none" value={password} onChange={e=>setPassword(e.target.value)} required />
            </div>
          </div>
          <button className="w-full bg-earth-900 text-white p-3 rounded font-bold mt-8 hover:bg-forest-700 transition-colors disabled:opacity-50" disabled={authLoading}>
            {authLoading ? 'Signing in...' : 'Login'}
          </button>
          <div className="mt-6 text-center">
            <Link to="/" className="text-xs text-forest-600 hover:underline">← サイトに戻る</Link>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-earth-50">
      <nav className="bg-earth-900 text-white p-4 flex justify-between items-center px-6">
        <div className="flex items-center gap-6">
            <h1 className="font-bold serif tracking-wider">ADMIN PANEL</h1>
            <Link to="/" className="text-xs font-bold text-earth-300 hover:text-white transition-colors border-l border-earth-700 pl-6">サイトを表示する</Link>
        </div>
        <button onClick={() => supabase.auth.signOut()} className="text-xs font-bold bg-earth-800 px-4 py-2 rounded hover:bg-forest-600 transition-colors">Logout</button>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex gap-4 mb-6">
            {(['topics', 'news', 'skills'] as const).map((tab) => (
                <button key={tab} onClick={() => {setActiveTab(tab); resetForms();}} className={`px-6 py-2 rounded font-bold text-sm transition-all ${activeTab === tab ? 'bg-forest-600 text-white shadow-md' : 'bg-earth-200 text-earth-600 hover:bg-earth-300'}`}>
                    {tab.toUpperCase()}
                </button>
            ))}
        </div>

        {isCreating ? (
            <div className="bg-white p-6 rounded shadow-sm border border-earth-100 animate-fadeIn">
                <h2 className="text-xl font-bold mb-6 text-earth-900 serif border-b pb-4">
                    {editId ? 'データを編集' : '新規データ作成'} ({activeTab})
                </h2>
                
                <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
                    {activeTab === 'topics' && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-earth-500 mb-1 uppercase">タイトル</label>
                                    <input required className="w-full border p-2 rounded" value={topicForm.title || ''} onChange={e=>setTopicForm({...topicForm, title: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-earth-500 mb-1 uppercase">スラグ (URL識別子)</label>
                                    <input placeholder="auto-generated-if-empty" className="w-full border p-2 rounded bg-earth-50" value={topicForm.slug || ''} onChange={e=>setTopicForm({...topicForm, slug: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-earth-500 mb-1 uppercase">カテゴリ</label>
                                    <select className="w-full border p-2 rounded" value={topicForm.category} onChange={e=>setTopicForm({...topicForm, category: e.target.value as Category})}>
                                        <option value="Projects">Projects</option>
                                        <option value="Works">Works</option>
                                        <option value="Others">Others</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-earth-500 mb-1 uppercase">役割 (Role)</label>
                                    <input className="w-full border p-2 rounded" placeholder="Main Developer, Designer, etc." value={topicForm.role || ''} onChange={e=>setTopicForm({...topicForm, role: e.target.value})} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-earth-500 mb-1 uppercase">サマリー（一覧用・短い説明）</label>
                                <textarea required className="w-full border p-2 rounded" rows={2} value={topicForm.summary || ''} onChange={e=>setTopicForm({...topicForm, summary: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-earth-500 mb-1 uppercase">本文（詳細ページ用・詳細説明）</label>
                                <textarea className="w-full border p-2 rounded font-mono text-sm" rows={10} placeholder="取り組みの詳細、背景、成果などを記述してください。" value={topicForm.body || ''} onChange={e=>setTopicForm({...topicForm, body: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-earth-500 mb-1 uppercase">プロジェクト画像</label>
                                <div className="mt-2 flex items-start gap-4">
                                    <div className="flex-grow">
                                        <input type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-earth-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-forest-50 file:text-forest-700 hover:file:bg-forest-100 transition-all" />
                                        <p className="mt-1 text-[10px] text-earth-400">※推奨アスペクト比 16:9 / JPG, PNG, WEBP</p>
                                    </div>
                                    {uploadPreview && (
                                        <div className="w-32 h-20 rounded border border-earth-100 overflow-hidden bg-earth-50 shadow-inner">
                                            <img src={uploadPreview} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-earth-500 mb-1 uppercase tracking-wider">タグ（「、」または「,」で区切って入力）</label>
                                <input 
                                  className="w-full border p-3 rounded text-sm bg-white focus:ring-2 focus:ring-forest-500 outline-none transition-all" 
                                  placeholder="IoT、狩猟、プログラミング、共同開発" 
                                  value={tagInputValue} 
                                  onChange={e => handleTagChange(e.target.value)} 
                                />
                                {/* Tag Preview Boxes */}
                                <div className="mt-3 flex flex-wrap gap-2 min-h-[36px] p-2 bg-earth-50 rounded border border-earth-100 border-dashed">
                                  {topicForm.tags && topicForm.tags.length > 0 ? (
                                    topicForm.tags.map((tag, idx) => (
                                      <span key={idx} className="inline-block bg-earth-100 text-earth-800 text-[11px] font-bold px-3 py-1.5 rounded-md border border-earth-200 animate-fadeIn">
                                        #{tag}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-[10px] text-earth-300 italic self-center">ここにタグのプレビューが表示されます</span>
                                  )}
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'news' && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-earth-500 mb-1 uppercase">ニュースタイトル</label>
                                    <input required className="w-full border p-2 rounded" value={newsForm.title || ''} onChange={e=>setNewsForm({...newsForm, title: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-earth-500 mb-1 uppercase">日付</label>
                                    <input type="date" required className="w-full border p-2 rounded" value={newsForm.date || ''} onChange={e=>setNewsForm({...newsForm, date: e.target.value})} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-earth-500 mb-1 uppercase">リンクURL（任意）</label>
                                <input className="w-full border p-2 rounded" placeholder="https://..." value={newsForm.short_text || ''} onChange={e=>setNewsForm({...newsForm, short_text: e.target.value})} />
                            </div>
                        </>
                    )}

                    {activeTab === 'skills' && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-earth-500 mb-1 uppercase">スキル名</label>
                                    <input required className="w-full border p-2 rounded" value={skillForm.name || ''} onChange={e=>setSkillForm({...skillForm, name: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-earth-500 mb-1 uppercase">カテゴリ</label>
                                    <select className="w-full border p-2 rounded" value={skillForm.category} onChange={e=>setSkillForm({...skillForm, category: e.target.value as SkillCategory})}>
                                        <option value="Technology">Technology</option>
                                        <option value="Design">Design</option>
                                        <option value="Entrepreneurship">Entrepreneurship</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-earth-500 mb-1 uppercase">習得レベル (1-5)</label>
                                <input type="number" min="1" max="5" className="w-full border p-2 rounded" value={skillForm.level} onChange={e=>setSkillForm({...skillForm, level: parseInt(e.target.value)})} />
                            </div>
                        </>
                    )}

                    <div className="flex gap-3 pt-4 border-t">
                        <button type="submit" disabled={saving} className="bg-forest-600 text-white px-8 py-2 rounded font-bold hover:bg-forest-700 transition-colors disabled:opacity-50 flex items-center gap-2">
                            {saving ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    保存中...
                                </>
                            ) : '保存する'}
                        </button>
                        <button type="button" onClick={resetForms} className="bg-earth-100 text-earth-600 px-8 py-2 rounded font-bold hover:bg-earth-200 transition-colors">
                            キャンセル
                        </button>
                    </div>
                </form>
            </div>
        ) : (
            <div className="bg-white rounded shadow-sm border border-earth-100 overflow-hidden">
                <div className="p-4 flex justify-between items-center bg-earth-100/50 border-b border-earth-100">
                    <h2 className="font-bold text-earth-800">{activeTab.toUpperCase()} 管理</h2>
                    <button onClick={() => setIsCreating(true)} className="bg-forest-600 text-white px-4 py-1.5 rounded font-bold text-sm shadow-sm hover:bg-forest-700 transition-colors">+ 新規追加</button>
                </div>
                
                <div className="overflow-x-auto">
                    {loadingData ? (
                        <div className="p-12 text-center text-earth-400">読み込み中...</div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-earth-50 text-earth-400 text-[10px] uppercase font-bold tracking-widest">
                                    <th className="p-4">情報</th>
                                    <th className="p-4">内容</th>
                                    <th className="p-4 text-right">操作</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-earth-50">
                                {activeTab === 'skills' && skills.map(s => (
                                    <tr key={s.id} className="hover:bg-earth-50 transition-colors">
                                        <td className="p-4">
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-earth-200 text-earth-600">{s.category}</span>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold text-earth-900">{s.name}</div>
                                            <div className="text-xs text-earth-400">Level: {s.level}</div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button onClick={()=>handleEdit(s)} className="text-forest-600 font-bold text-xs mr-4 hover:underline">編集</button>
                                            <button onClick={()=>handleDelete('skills', s.id)} className="text-red-500 font-bold text-xs hover:underline">削除</button>
                                        </td>
                                    </tr>
                                ))}
                                {activeTab === 'topics' && topics.map(t => (
                                    <tr key={t.id} className="hover:bg-earth-50 transition-colors">
                                        <td className="p-4">
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-forest-100 text-forest-600">{t.category}</span>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold text-earth-900">{t.title}</div>
                                            <div className="text-[10px] text-earth-400 font-mono mb-1">/{t.slug}</div>
                                            <div className="text-xs text-earth-400 line-clamp-1">{t.summary}</div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button onClick={()=>handleEdit(t)} className="text-forest-600 font-bold text-xs mr-4 hover:underline">編集</button>
                                            <button onClick={()=>handleDelete('topics', t.id)} className="text-red-500 font-bold text-xs hover:underline">削除</button>
                                        </td>
                                    </tr>
                                ))}
                                {activeTab === 'news' && news.map(n => (
                                    <tr key={n.id} className="hover:bg-earth-50 transition-colors">
                                        <td className="p-4">
                                            <span className="text-xs font-mono text-earth-400">{n.date}</span>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold text-earth-900">{n.title}</div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button onClick={()=>handleEdit(n)} className="text-forest-600 font-bold text-xs mr-4 hover:underline">編集</button>
                                            <button onClick={()=>handleDelete('news', n.id)} className="text-red-500 font-bold text-xs hover:underline">削除</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};