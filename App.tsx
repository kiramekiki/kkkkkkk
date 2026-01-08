import React, { useState, useEffect, useMemo } from 'react';
import { Menu, Moon, Sun, Search, Plus, Loader2, X, Edit2, Trash2, BookHeart, Sparkles } from 'lucide-react';
import { Category, Entry, RATING_WEIGHTS, Rating, CATEGORY_DISPLAY_MAP } from './types';
import Sidebar from './components/Sidebar';
import AddEntryModal from './components/AddEntryModal';

const App: React.FC = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [expandedEntry, setExpandedEntry] = useState<Entry | null>(null);

  const fetchEntries = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/get');
      if (res.ok) setEntries(await res.json());
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchEntries(); }, []);

  const filteredEntries = useMemo(() => {
    return entries.filter(e => {
      const matchesCat = selectedCategory === 'ALL' || e.category === selectedCategory;
      const matchesSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           e.author.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCat && matchesSearch;
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [entries, selectedCategory, searchTerm]);

  const handleDelete = async (entryId: number) => {
    const password = prompt('管理員密碼：');
    if (!password || !confirm('確定刪除？')) return;
    try {
      const res = await fetch('/api/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: entryId, password }),
      });
      if (res.ok) { fetchEntries(); setExpandedEntry(null); }
    } catch (e) { alert('刪除失敗'); }
  };

  return (
    <div className="flex min-h-screen bg-[#F9F8F6] text-[#5E5045] font-sans overflow-hidden">
      <Sidebar 
        isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} 
        selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="p-6 flex justify-between items-center z-20">
          <button onClick={() => setSidebarOpen(true)} className="p-3 bg-white rounded-xl shadow-sm border border-[#E2DDD9] lg:hidden">
            <Menu size={20} />
          </button>
          <div className="flex-1 max-w-md mx-4 relative hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A8A29E]" size={16} />
            <input 
              type="text" placeholder="搜尋館藏..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 rounded-full border border-[#E2DDD9] bg-white outline-none focus:border-[#8C7B6D] transition-all"
            />
          </div>
          <button onClick={() => setIsModalOpen(true)} className="px-6 py-2.5 bg-[#8C7B6D] text-white rounded-full font-bold shadow-lg flex items-center gap-2">
            <Plus size={18} /> <span>新增登記</span>
          </button>
        </header>

        <main className="flex-1 overflow-y-auto px-6 md:px-12 pb-20 custom-scrollbar text-left">
          <div className="max-w-5xl mx-auto mt-6">
            <h1 className="text-4xl font-serif font-bold mb-12 text-center tracking-tight opacity-90">
              {selectedCategory === 'ALL' ? '全部收藏紀錄' : (CATEGORY_DISPLAY_MAP[selectedCategory] || selectedCategory)}
            </h1>

            {isLoading ? (
              <div className="flex flex-col items-center py-20 text-[#A8A29E]"><Loader2 className="animate-spin mb-4" />載入館藏中...</div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {filteredEntries.map((entry) => (
                  <div key={entry.id} onClick={() => setExpandedEntry(entry)} className="flex h-56 bg-white rounded-[24px] border border-[#E2DDD9] overflow-hidden hover:shadow-2xl transition-all duration-500 group relative cursor-pointer">
                    <div className="w-36 md:w-44 h-full flex-shrink-0 overflow-hidden bg-stone-100">
                      <img src={entry.coverUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                    </div>
                    
                    <div className="flex-1 p-6 flex flex-col relative min-w-0">
                      {/* 右上角評分 */}
                      <div className={`absolute top-5 right-5 px-2.5 py-1 rounded-md text-[10px] font-bold border ${entry.rating === '聖經' ? 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]' : 'bg-stone-50 text-stone-500 border-stone-200'}`}>
                        {entry.rating}
                      </div>
                      {/* 分類標籤：淡灰色 + 寬字距 */}
                      <span className="text-[10px] font-bold text-[#A8A29E] tracking-[0.2em] uppercase mb-1">
                        {CATEGORY_DISPLAY_MAP[entry.category] || entry.category}
                      </span>
                      <h3 className="text-xl font-bold font-serif mb-0.5 truncate pr-16 text-[#5E5045]">{entry.title}</h3>
                      <p className="text-xs text-[#A8A29E] mb-3 font-medium">by {entry.author}</p>
                      <p className="text-sm italic text-[#8C7B6D] line-clamp-2 font-serif opacity-85 leading-relaxed mb-auto">
                        "{entry.note || '尚未留下讀後感。'}"
                      </p>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex gap-2">
                          {entry.tags?.slice(0, 2).map(tag => (
                            <span key={tag} className="px-2 py-0.5 bg-[#F9F8F6] text-[#A8A29E] text-[10px] rounded border border-[#E2DDD9]">#{tag}</span>
                          ))}
                        </div>
                        {entry.plurkUrl && <span className="text-[#E2DDD9] italic font-serif">P</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* 沉浸式詳情彈窗 (1/2 比例) */}
      {expandedEntry && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-md" onClick={() => setExpandedEntry(null)} />
          <div className="relative bg-white w-full max-w-4xl rounded-[32px] overflow-hidden flex flex-col md:flex-row h-[75vh] animate-in zoom-in-95 duration-300 shadow-2xl">
             <button onClick={() => setExpandedEntry(null)} className="absolute top-6 right-6 p-2 bg-white rounded-full z-10 shadow-md text-[#8C7B6D]"><X size={24} /></button>
             
             <div className="md:w-1/2 h-full"><img src={expandedEntry.coverUrl} className="w-full h-full object-cover" alt="" /></div>
             
             <div className="flex-1 p-10 flex flex-col text-left overflow-y-auto relative">
               <div className="flex gap-3 mb-6">
                 {/* 詳情頁分類標籤：藍色 */}
                 <span className="px-4 py-1 rounded-full border border-blue-400 text-blue-500 text-[10px] font-bold uppercase tracking-widest">
                   {expandedEntry.category}
                 </span>
                 <span className={`px-4 py-1 rounded-full text-[10px] font-bold border ${expandedEntry.rating === '聖經' ? 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]' : 'bg-stone-50 text-stone-500 border-stone-200'}`}>
                   {expandedEntry.rating}
                 </span>
               </div>
               
               <h2 className="text-4xl font-serif font-bold text-[#5E5045] mb-2 leading-tight">{expandedEntry.title}</h2>
               <p className="text-lg text-[#A8A29E] font-serif italic mb-8">by {expandedEntry.author}</p>
               
               <div className="text-xl leading-relaxed text-[#8C7B6D] font-serif italic border-l-2 border-stone-200 pl-6 mb-10 whitespace-pre-wrap flex-1">
                 "{expandedEntry.note || '這份作品還沒有留下心得...'}"
               </div>

               <div className="flex flex-wrap gap-2 mb-10">
                 {expandedEntry.tags?.map(tag => (
                   <span key={tag} className="px-3 py-1 bg-stone-100 text-stone-400 text-xs rounded">#{tag}</span>
                 ))}
               </div>

               {/* 右下角管理按鈕 */}
               <div className="mt-auto flex justify-between items-center">
                 {expandedEntry.plurkUrl ? (
                   <a href={expandedEntry.plurkUrl} target="_blank" className="text-2xl font-serif italic text-stone-300 hover:text-[#8C7B6D]">P</a>
                 ) : <div />}
                 <div className="flex gap-4">
                   <button onClick={() => { setEditingEntry(expandedEntry); setIsModalOpen(true); }} className="text-stone-300 hover:text-stone-600 transition-colors"><Edit2 size={20} /></button>
                   <button onClick={() => handleDelete(expandedEntry.id)} className="text-stone-300 hover:text-rose-400 transition-colors"><Trash2 size={20} /></button>
                 </div>
               </div>
             </div>
          </div>
        </div>
      )}

      <AddEntryModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingEntry(null); }} onRefresh={fetchEntries} entry={editingEntry} />
    </div>
  );
};

export default App;
