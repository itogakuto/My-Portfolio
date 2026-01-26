
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Topic, News, Category, Skill, SkillCategory, Experience } from '../types';

export const Admin: React.FC = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<'topics' | 'news' | 'skills' | 'experiences'>('topics');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  
  const [isCreating, setIsCreating] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  const [topicForm, setTopicForm] = useState<Partial<Topic>>({ category: 'Projects', tags: [], title: '', slug: '', summary: '', body: '', role: '', image_url: '', sort_order: 0 });
  const [newsForm, setNewsForm] = useState<Partial<News>>({ title: '', short_text: '', date: new Date().toISOString().split('T')[0], sort_order: 0 });
  const [skillForm, setSkillForm] = useState<Partial<Skill>>({ category: 'Technology', level: 3, name: '', sort_order: 0 });
  const [expForm, setExpForm] = useState<Partial<Experience>>({ title: '', summary: '', body: '', slug: '', image_url: '', sort_order: 0 });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
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
    try {
      // sort_orderの昇順を第一優先にする
      const { data: topicsData } = await supabase.from('topics').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: false });
      if (topicsData) setTopics(topicsData);
      
      const { data: newsData } = await supabase.from('news').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: false });
      if (newsData) setNews(newsData);
      
      const { data: skillsData } = await supabase.from('skills').select('*').order('category', { ascending: true }).order('sort_order', { ascending: true });
      if (skillsData) setSkills(skillsData);
      
      const { data: expData } = await supabase.from('experiences').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: false });
      if (expData) setExperiences(expData);
    } catch (err) {
      console.error('Data fetch error:', err);
    } finally {
      setLoadingData(false);
    }
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
      setTopicForm({ category: 'Projects', tags: [], title: '', slug: '', summary: '', body: '', role: '', image_url: '', sort_order: 0 });
      setNewsForm({ title: '', short_text: '', date: new Date().toISOString().split('T')[0], sort_order: 0 });
      setSkillForm({ category: 'Technology', level: 3, name: '', sort_order: 0 });
      setExpForm({ title: '', summary: '', body: '', slug: '', image_url: '', sort_order: 0 });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setSelectedFile(file);
          setUploadPreview(URL.createObjectURL(file));
      }
  };

  const uploadImage = async (file: File, folder: string): Promise<string | null> => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, file, {
            upsert: true,
            cacheControl: '3600'
          });

      if (uploadError) throw new Error('アップロード失敗: ' + uploadError.message);
      const { data } = supabase.storage.from('images').getPublicUrl(filePath);
      return data.publicUrl;
  };

  const handleEdit = (item: any) => {
      setEditId(item.id);
      if (activeTab === 'topics') {
          setTopicForm({ ...item });
          setTagInputValue(item.tags?.join('、') || '');
          setUploadPreview(item.image_url || null);
      }
      if (activeTab === 'news') setNewsForm({ ...item });
      if (activeTab === 'skills') setSkillForm({ ...item });
      if (activeTab === 'experiences') {
          setExpForm({ ...item });
          setUploadPreview(item.image_url || null);
      }
      setIsCreating(true);
  };

  const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      setSaving(true);
      
      try {
          let table = '';
          let payload: any = {};
          
          if (activeTab === 'topics') {
              table = 'topics';
              const finalSlug = topicForm.slug || topicForm.title?.toLowerCase().replace(/[^a-z0-9ー\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]+/g, '-').replace(/^-+|-+$/g, '') || `topic-${Date.now()}`;
              let finalImageUrl = topicForm.image_url;
              if (selectedFile) {
                  const uploadedUrl = await uploadImage(selectedFile, 'topics');
                  if (uploadedUrl) finalImageUrl = uploadedUrl;
              }
              payload = { ...topicForm, slug: finalSlug, image_url: finalImageUrl, status: 'published' };
          } else if (activeTab === 'news') {
              table = 'news';
              payload = { ...newsForm };
          } else if (activeTab === 'skills') {
              table = 'skills';
              payload = { ...skillForm };
          } else if (activeTab === 'experiences') {
              table = 'experiences';
              const finalSlug = expForm.slug || expForm.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || `exp-${Date.now()}`;
              let finalImageUrl = expForm.image_url;
              if (selectedFile) {
                  const uploadedUrl = await uploadImage(selectedFile, 'experiences');
                  if (uploadedUrl) finalImageUrl = uploadedUrl;
              }
              payload = { ...expForm, slug: finalSlug, image_url: finalImageUrl };
          }

          const { id, created_at, updated_at, ...cleanPayload } = payload;

          if (editId) {
              const { error } = await supabase.from(table).update(cleanPayload).eq('id', editId);
              if (error) throw error;
          } else {
              const { error } = await supabase.from(table).insert([cleanPayload]);
              if (error) throw error;
          }
          
          alert("保存しました");
          resetForms();
          fetchData();
      } catch (error: any) {
          console.error('Save error:', error);
          alert("保存エラー: " + (error.message || "不明なエラー"));
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

  const handleTagChange = (value: string) => {
    setTagInputValue(value);
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
          <div className="mt-6 text-center"><Link to="/" className="text-xs text-forest-600 hover:underline">← サイトに戻る</Link></div>
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
        <div className="flex gap-4 mb-6 flex-wrap">
            {(['topics', 'news', 'skills', 'experiences'] as const).map((tab) => (
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
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-2"><label className="block text-xs font-bold text-earth-500 mb-1 uppercase">タイトル</label><input required className="w-full border p-2 rounded" value={topicForm.title || ''} onChange={e=>setTopicForm({...topicForm, title: e.target.value})} /></div>
                                <div><label className="block text-xs font-bold text-earth-500 mb-1 uppercase">表示順 (小さい順)</label><input type="number" className="w-full border p-2 rounded" value={topicForm.sort_order || 0} onChange={e=>setTopicForm({...topicForm, sort_order: parseInt(e.target.value)})} /></div>
                                <div><label className="block text-xs font-bold text-earth-500 mb-1 uppercase">スラグ</label><input className="w-full border p-2 rounded bg-earth-50" value={topicForm.slug || ''} onChange={e=>setTopicForm({...topicForm, slug: e.target.value})} /></div>
                                <div><label className="block text-xs font-bold text-earth-500 mb-1 uppercase">カテゴリ</label>
                                    <select className="w-full border p-2 rounded" value={topicForm.category} onChange={e=>setTopicForm({...topicForm, category: e.target.value as Category})}>
                                        <option value="Projects">Projects</option><option value="Works">Works</option><option value="Others">Others</option>
                                    </select>
                                </div>
                                <div><label className="block text-xs font-bold text-earth-500 mb-1 uppercase">役割</label><input className="w-full border p-2 rounded" value={topicForm.role || ''} onChange={e=>setTopicForm({...topicForm, role: e.target.value})} /></div>
                            </div>
                            <div><label className="block text-xs font-bold text-earth-500 mb-1 uppercase">サマリー</label><textarea required className="w-full border p-2 rounded" rows={2} value={topicForm.summary || ''} onChange={e=>setTopicForm({...topicForm, summary: e.target.value})} /></div>
                            <div><label className="block text-xs font-bold text-earth-500 mb-1 uppercase">本文</label><textarea className="w-full border p-2 rounded font-mono text-sm" rows={10} value={topicForm.body || ''} onChange={e=>setTopicForm({...topicForm, body: e.target.value})} /></div>
                            <div>
                                <label className="block text-xs font-bold text-earth-500 mb-1 uppercase">プロジェクト画像</label>
                                <div className="mt-2 flex items-start gap-4">
                                    <input type="file" accept="image/*" onChange={handleFileChange} className="block text-sm text-earth-500 file:bg-forest-50 file:text-forest-700" />
                                    {uploadPreview && <div className="w-32 h-20 rounded border overflow-hidden"><img src={uploadPreview} className="w-full h-full object-cover" /></div>}
                                </div>
                            </div>
                            <div><label className="block text-xs font-bold text-earth-500 mb-1 uppercase tracking-wider">タグ</label><input className="w-full border p-3 rounded text-sm" placeholder="IoT、狩猟..." value={tagInputValue} onChange={e => handleTagChange(e.target.value)} /></div>
                        </>
                    )}
                    {activeTab === 'news' && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-1"><label className="block text-xs font-bold text-earth-500 mb-1 uppercase">ニュースタイトル</label><input required className="w-full border p-2 rounded" value={newsForm.title || ''} onChange={e=>setNewsForm({...newsForm, title: e.target.value})} /></div>
                                <div><label className="block text-xs font-bold text-earth-500 mb-1 uppercase">日付</label><input type="date" required className="w-full border p-2 rounded" value={newsForm.date || ''} onChange={e=>setNewsForm({...newsForm, date: e.target.value})} /></div>
                                <div><label className="block text-xs font-bold text-earth-500 mb-1 uppercase">表示順</label><input type="number" className="w-full border p-2 rounded" value={newsForm.sort_order || 0} onChange={e=>setNewsForm({...newsForm, sort_order: parseInt(e.target.value)})} /></div>
                            </div>
                            <div><label className="block text-xs font-bold text-earth-500 mb-1 uppercase">リンクURL</label><input className="w-full border p-2 rounded" value={newsForm.short_text || ''} onChange={e=>setNewsForm({...newsForm, short_text: e.target.value})} /></div>
                        </>
                    )}
                    {activeTab === 'skills' && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div><label className="block text-xs font-bold text-earth-500 mb-1 uppercase">スキル名</label><input required className="w-full border p-2 rounded" value={skillForm.name || ''} onChange={e=>setSkillForm({...skillForm, name: e.target.value})} /></div>
                                <div><label className="block text-xs font-bold text-earth-500 mb-1 uppercase">カテゴリ</label>
                                    <select className="w-full border p-2 rounded" value={skillForm.category} onChange={e=>setSkillForm({...skillForm, category: e.target.value as SkillCategory})}>
                                        <option value="Technology">Technology</option><option value="Design">Design</option><option value="Other">Other</option>
                                    </select>
                                </div>
                                <div><label className="block text-xs font-bold text-earth-500 mb-1 uppercase">表示順</label><input type="number" className="w-full border p-2 rounded" value={skillForm.sort_order || 0} onChange={e=>setSkillForm({...skillForm, sort_order: parseInt(e.target.value)})} /></div>
                            </div>
                            <div><label className="block text-xs font-bold text-earth-500 mb-1 uppercase">レベル (1-5)</label><input type="number" min="1" max="5" className="w-full border p-2 rounded" value={skillForm.level} onChange={e=>setSkillForm({...skillForm, level: parseInt(e.target.value)})} /></div>
                        </>
                    )}
                    {activeTab === 'experiences' && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-1"><label className="block text-xs font-bold text-earth-500 mb-1 uppercase">体験のタイトル</label><input required className="w-full border p-2 rounded" value={expForm.title || ''} onChange={e=>setExpForm({...expForm, title: e.target.value})} /></div>
                                <div><label className="block text-xs font-bold text-earth-500 mb-1 uppercase">スラグ</label><input className="w-full border p-2 rounded bg-earth-50" value={expForm.slug || ''} onChange={e=>setExpForm({...expForm, slug: e.target.value})} /></div>
                                <div><label className="block text-xs font-bold text-earth-500 mb-1 uppercase">表示順</label><input type="number" className="w-full border p-2 rounded" value={expForm.sort_order || 0} onChange={e=>setExpForm({...expForm, sort_order: parseInt(e.target.value)})} /></div>
                            </div>
                            <div><label className="block text-xs font-bold text-earth-500 mb-1 uppercase">サマリー</label><textarea required className="w-full border p-2 rounded" rows={2} value={expForm.summary || ''} onChange={e=>setExpForm({...expForm, summary: e.target.value})} /></div>
                            <div><label className="block text-xs font-bold text-earth-500 mb-1 uppercase">詳細内容</label><textarea className="w-full border p-2 rounded" rows={6} value={expForm.body || ''} onChange={e=>setExpForm({...expForm, body: e.target.value})} /></div>
                            <div>
                                <label className="block text-xs font-bold text-earth-500 mb-1 uppercase">体験の画像</label>
                                <div className="mt-2 flex items-start gap-4">
                                    <input type="file" accept="image/*" onChange={handleFileChange} className="block text-sm text-earth-500" />
                                    {uploadPreview && <div className="w-32 h-20 rounded border overflow-hidden"><img src={uploadPreview} className="w-full h-full object-cover" /></div>}
                                </div>
                            </div>
                        </>
                    )}
                    <div className="flex gap-3 pt-4 border-t">
                        <button type="submit" disabled={saving} className="bg-forest-600 text-white px-8 py-2 rounded font-bold hover:bg-forest-700 disabled:opacity-50">
                            {saving ? '保存中...' : '保存する'}
                        </button>
                        <button type="button" onClick={resetForms} className="bg-earth-100 text-earth-600 px-8 py-2 rounded font-bold">キャンセル</button>
                    </div>
                </form>
            </div>
        ) : (
            <div className="bg-white rounded shadow-sm border border-earth-100 overflow-hidden">
                <div className="p-4 flex justify-between items-center bg-earth-100/50">
                    <h2 className="font-bold text-earth-800">{activeTab.toUpperCase()} 管理</h2>
                    <button onClick={() => setIsCreating(true)} className="bg-forest-600 text-white px-4 py-1.5 rounded font-bold text-sm shadow-sm hover:bg-forest-700 transition-colors">+ 新規追加</button>
                </div>
                <div className="overflow-x-auto">
                    {loadingData ? (
                        <div className="p-12 text-center text-earth-400">読み込み中...</div>
                    ) : (
                        <table className="w-full text-left">
                            <thead><tr className="bg-earth-50 text-earth-400 text-[10px] uppercase font-bold tracking-widest"><th className="p-4">順序</th><th className="p-4">情報</th><th className="p-4">内容</th><th className="p-4 text-right">操作</th></tr></thead>
                            <tbody className="divide-y divide-earth-50">
                                {activeTab === 'skills' && skills.map(s => (
                                    <tr key={s.id} className="hover:bg-earth-50 transition-colors"><td className="p-4 font-mono text-xs">{s.sort_order}</td><td className="p-4"><span className="text-[10px] font-bold px-2 py-0.5 rounded bg-earth-200 text-earth-600">{s.category}</span></td><td className="p-4"><div className="font-bold text-earth-900">{s.name}</div><div className="text-xs text-earth-400">Level: {s.level}</div></td><td className="p-4 text-right"><button onClick={()=>handleEdit(s)} className="text-forest-600 font-bold text-xs mr-4 hover:underline">編集</button><button onClick={()=>handleDelete('skills', s.id)} className="text-red-500 font-bold text-xs hover:underline">削除</button></td></tr>
                                ))}
                                {activeTab === 'topics' && topics.map(t => (
                                    <tr key={t.id} className="hover:bg-earth-50 transition-colors"><td className="p-4 font-mono text-xs">{t.sort_order}</td><td className="p-4"><span className="text-[10px] font-bold px-2 py-0.5 rounded bg-forest-100 text-forest-600">{t.category}</span></td><td className="p-4"><div className="font-bold text-earth-900">{t.title}</div><div className="text-[10px] text-earth-400 font-mono mb-1">/{t.slug}</div><div className="text-xs text-earth-400 line-clamp-1">{t.summary}</div></td><td className="p-4 text-right"><button onClick={()=>handleEdit(t)} className="text-forest-600 font-bold text-xs mr-4 hover:underline">編集</button><button onClick={()=>handleDelete('topics', t.id)} className="text-red-500 font-bold text-xs hover:underline">削除</button></td></tr>
                                ))}
                                {activeTab === 'news' && news.map(n => (
                                    <tr key={n.id} className="hover:bg-earth-50 transition-colors"><td className="p-4 font-mono text-xs">{n.sort_order}</td><td className="p-4"><span className="text-xs font-mono text-earth-400">{n.date}</span></td><td className="p-4"><div className="font-bold text-earth-900">{n.title}</div></td><td className="p-4 text-right"><button onClick={()=>handleEdit(n)} className="text-forest-600 font-bold text-xs mr-4 hover:underline">編集</button><button onClick={()=>handleDelete('news', n.id)} className="text-red-500 font-bold text-xs hover:underline">削除</button></td></tr>
                                ))}
                                {activeTab === 'experiences' && experiences.map(e => (
                                    <tr key={e.id} className="hover:bg-earth-50 transition-colors"><td className="p-4 font-mono text-xs">{e.sort_order}</td><td className="p-4"><div className="w-10 h-10 bg-earth-100 rounded overflow-hidden">{e.image_url && <img src={e.image_url} className="w-full h-full object-cover" />}</div></td><td className="p-4"><div className="font-bold text-earth-900">{e.title}</div><div className="text-xs text-earth-400 line-clamp-1">{e.summary}</div></td><td className="p-4 text-right"><button onClick={()=>handleEdit(e)} className="text-forest-600 font-bold text-xs mr-4 hover:underline">編集</button><button onClick={()=>handleDelete('experiences', e.id)} className="text-red-500 font-bold text-xs hover:underline">削除</button></td></tr>
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
