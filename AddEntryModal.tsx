import React, { useState, useEffect } from 'react';
import { Category, Rating, Entry } from '../types';
import { X, Link as LinkIcon, Lock } from 'lucide-react';

interface AddEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
  entry?: Entry | null;
}

const AddEntryModal: React.FC<AddEntryModalProps> = ({ isOpen, onClose, onRefresh, entry }) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState<Category>(Category.MANGA);
  const [rating, setRating] = useState<Rating>(Rating.ORDINARY);
  const [note, setNote] = useState('');
  const [tags, setTags] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [plurkUrl, setPlurkUrl] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state with entry prop when editing
  useEffect(() => {
    if (entry) {
      setTitle(entry.title);
      setAuthor(entry.author);
      setCategory(entry.category);
      setRating(entry.rating);
      setNote(entry.note || '');
      setTags(entry.tags.join(' '));
      setCoverUrl(entry.coverUrl || '');
      setPlurkUrl(entry.plurkUrl || '');
    } else {
      // Reset for new entry
      setTitle('');
      setAuthor('');
      setCategory(Category.MANGA);
      setRating(Rating.ORDINARY);
      setNote('');
      setTags('');
      setCoverUrl('');
      setPlurkUrl('');
    }
  }, [entry, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !author || !password) {
      alert('請填寫完整資訊與密碼');
      return;
    }

    setIsSubmitting(true);
    const endpoint = entry ? '/api/edit' : '/api/add';
    const payload = {
      id: entry?.id, // Only for edit
      title,
      author,
      category,
      rating,
      note,
      tags: tags.split(/[,， ]+/).filter(t => t.trim().length > 0),
      coverUrl: coverUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=200&h=300',
      plurkUrl,
      password
    };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || (entry ? '編輯失敗' : '發布失敗'));
      }

      alert(entry ? '編輯成功！' : '登記成功！');
      onRefresh();
      onClose();
      setPassword('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-[#fbf7f3] dark:bg-stone-800 rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] border border-stone-200 dark:border-stone-700">
        <div className="p-6 border-b border-stone-200 dark:border-stone-700 flex justify-between items-center">
          <h2 className="text-xl font-serif font-bold text-stone-800 dark:text-stone-100">
            {entry ? '編輯收藏登記' : '新增收藏登記'}
          </h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200">
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 custom-scrollbar">
          <form id="add-entry-form" onSubmit={handleSubmit} className="space-y-5">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">作品名稱 *</label>
                  <input 
                    type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-100 focus:border-stone-400 outline-none transition-colors font-serif"
                    placeholder="例如：終將成為妳"
                  />
              </div>
              <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">作者 *</label>
                  <input 
                    type="text" required value={author} onChange={(e) => setAuthor(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-100 focus:border-stone-400 outline-none transition-colors"
                    placeholder="作者姓名"
                  />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">封面圖片網址</label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={14} />
                  <input 
                    type="url" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-100 focus:border-stone-400 outline-none transition-colors text-sm"
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Plurk 網址</label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={14} />
                  <input 
                    type="url" value={plurkUrl} onChange={(e) => setPlurkUrl(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-100 focus:border-stone-400 outline-none transition-colors text-sm"
                    placeholder="貼上噗文連結"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">分類</label>
                <select 
                  value={category} onChange={(e) => setCategory(e.target.value as Category)}
                  className="w-full px-3 py-2 rounded border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-100 focus:border-stone-400 outline-none"
                >
                  {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">心中定位</label>
                <select 
                  value={rating} onChange={(e) => setRating(e.target.value as Rating)}
                  className="w-full px-3 py-2 rounded border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-100 focus:border-stone-400 outline-none"
                >
                  {Object.values(Rating).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">標籤 (空格分隔)</label>
              <input 
                type="text" value={tags} onChange={(e) => setTags(e.target.value)}
                className="w-full px-3 py-2 rounded border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-100 focus:border-stone-400 outline-none transition-colors text-sm"
                placeholder="校園 治癒 胃痛..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">心得小記</label>
              <textarea 
                value={note} onChange={(e) => setNote(e.target.value)}
                className="w-full px-4 py-2 rounded border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-100 focus:border-stone-400 outline-none transition-shadow resize-none h-20 text-sm leading-relaxed"
                placeholder="分享您的讀後感..."
              />
            </div>

            <div className="pt-4 border-t border-stone-100 dark:border-stone-700">
              <label className="block text-xs font-bold text-rose-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Lock size={12} /> 管理員密碼 *
              </label>
              <input 
                type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded border border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-stone-900 text-stone-800 dark:text-stone-100 focus:border-rose-400 outline-none transition-colors"
                placeholder="請輸入編輯密碼"
              />
            </div>

          </form>
        </div>

        <div className="p-4 border-t border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 flex justify-end gap-3">
          <button 
            type="button" onClick={onClose}
            className="px-4 py-2 rounded text-sm text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
          >
            取消
          </button>
          <button 
            type="submit" form="add-entry-form" disabled={isSubmitting}
            className={`px-6 py-2 rounded bg-stone-700 text-white text-sm hover:bg-stone-800 transition-all shadow-md flex items-center gap-2 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? (entry ? '儲存中...' : '登記中...') : (entry ? '確認編輯' : '確認登記')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddEntryModal;