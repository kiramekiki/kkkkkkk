import React, { useState, useEffect, useMemo, useRef } from 'react';
// ★★★ 重點 1：新增 Save 圖示導入
import { Menu, Moon, Sun, Search, Plus, Heart, ChevronDown, Check, LayoutGrid, BookOpen, Book, Film, Tv, Gamepad2, Info, Loader2, ArrowUpDown, Clapperboard, X, Edit2, Trash2, Save, ChevronLeft, ChevronRight } from 'lucide-react';
import { Category, Entry, RATING_STYLES, RATING_WEIGHTS, Rating, CATEGORY_STYLES, CATEGORY_DISPLAY_MAP } from './types';
import Sidebar from './components/Sidebar';
import AddEntryModal from './components/AddEntryModal';

const PlurkPIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M8 21V5h6a5 5 0 0 1 0 10H8" />
  </svg>
);

type SortOption = 'date-desc' | 'date-asc' | 'rating-desc' | 'rating-asc';

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem('theme') === 'dark' ||
             (!window.localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'ALL'>('ALL');
  const [selectedRating, setSelectedRating] = useState<Rating | 'ALL'>('ALL');
  
   // ★★★ 【更改 1：狀態定義】
  const [selectedTags, setSelectedTags] = useState<string[]>([]); // 複數標籤篩選
  const [isEditingExpanded, setIsEditingExpanded] = useState(false); // 原地編輯開關
  const [editForm, setEditForm] = useState<Partial<Entry>>({}); // 編輯緩存
  const [currentPage, setCurrentPage] = useState(1);

  // --- 【標註區域 1：itemsPerPage 設定】 ---
  const itemsPerPage = 24; // ★★★ 每頁顯示 24 張，讀取快且工整
  
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [expandedEntry, setExpandedEntry] = useState<Entry | null>(null);
  const [isRatingDropdownOpen, setIsRatingDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  
  // ★★★ 【更改 2：修正 Refs 定義（不可重複宣告）】
  const ratingDropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  const fetchEntries = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/get');
      if (response.ok) {
        const data = await response.json();
        setEntries(data);
      }
    } catch (err) { console.error(err); } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchEntries(); }, []);

  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) { html.classList.add('dark'); localStorage.setItem('theme', 'dark'); }
    else { html.classList.remove('dark'); localStorage.setItem('theme', 'light'); }
  }, [isDarkMode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ratingDropdownRef.current && !ratingDropdownRef.current.contains(event.target as Node)) setIsRatingDropdownOpen(false);
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) setIsSortDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ★★★ 【更改 3：標籤切換邏輯】
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

   // ★★★ 【重點修改：帶密碼驗證的原地儲存邏輯】
  const handleInlineSave = async () => {
    if (!expandedEntry) return;
    
    const password = prompt('請輸入管理員密碼以儲存更改：');
    if (!password) return;

    // 將標籤字串轉回陣列
    const finalTags = typeof editForm.tags === 'string' 
      ? (editForm.tags as string).split(/\s+/).filter(t => t.length > 0)
      : expandedEntry.tags;

    try {
      const response = await fetch('/api/edit', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
          ...expandedEntry, 
          ...editForm, 
          tags: finalTags,
          password // 將密碼傳送至後端驗證
        }) 
      });
      
      if (response.ok) {
        setIsEditingExpanded(false);
        setExpandedEntry({ ...expandedEntry, ...editForm, tags: finalTags } as Entry);
        fetchEntries();
        alert('儲存成功！');
      } else {
        const errData = await response.json();
        alert(errData.error || '儲存失敗，請檢查密碼');
      }
    } catch (err) { alert('更新發生錯誤'); }
  };

// --- 【修正重點：數據計算區域 - 完整版】 ---
  
  // 1. 定義 stats (負責頁尾統計)
  const stats = useMemo(() => ({
    total: entries.length,
    manga: entries.filter(e => e.category === Category.MANGA).length,
    novel: entries.filter(e => e.category === Category.NOVEL).length,
    movie: entries.filter(e => e.category === Category.MOVIE).length
  }), [entries]);

  // 2. 定義 paginatedEntries (負責篩選、排序、分頁)
  const { paginatedEntries, totalPages } = useMemo(() => {
    // A. 篩選
    let filtered = [...entries].filter(entry => {
      const matchesCategory = selectedCategory === 'ALL' || entry.category === selectedCategory;
      const matchesRating = selectedRating === 'ALL' || entry.rating === selectedRating;
      const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) || entry.author.toLowerCase().includes(searchTerm.toLowerCase());
      const entryTags = Array.isArray(entry.tags) ? entry.tags : [];
      const matchesTags = selectedTags.length === 0 || selectedTags.every(t => entryTags.includes(t));
      return matchesCategory && matchesRating && matchesSearch && matchesTags;
    });

    // B. 排序 (這段不能少，按鈕才會有反應)
    filtered.sort((a, b) => {
      if (sortBy === 'date-desc') return (b.createdAt || 0) - (a.createdAt || 0);
      if (sortBy === 'date-asc') return (a.createdAt || 0) - (b.createdAt || 0);
      const weightA = RATING_WEIGHTS[a.rating] || 0;
      const weightB = RATING_WEIGHTS[b.rating] || 0;
      return sortBy === 'rating-desc' ? weightB - weightA : weightA - weightB;
    });

    // C. 計算分頁並切片
    const total = Math.ceil(filtered.length / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    
    return { 
      paginatedEntries: filtered.slice(start, start + itemsPerPage), 
      totalPages: total || 1 
    };
    // ★★★ 注意：這裡必須有結束括號和依賴陣列
  }, [entries, selectedCategory, selectedRating, selectedTags, searchTerm, sortBy, currentPage]);

  const handleEdit = (entry: Entry) => { setEditingEntry(entry); setIsModalOpen(true); };

  const handleDelete = async (entryId: string) => {
    const password = prompt('請輸入管理員密碼：');
    if (!password) return;
    if (!confirm('確定刪除嗎？')) return;
    try {
      const response = await fetch('/api/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: entryId, password }) });
      if (response.ok) { fetchEntries(); setExpandedEntry(null); }
    } catch (err) { alert('失敗'); }
  };

  const categoriesList = [
    { id: 'ALL', label: '全部', icon: LayoutGrid },
    { id: Category.MANGA, label: '漫畫', icon: BookOpen },
    { id: Category.NOVEL, label: '小說', icon: Book },
    { id: Category.MOVIE, label: '電影', icon: Film },
    { id: Category.ANIMATION, label: '動畫', icon: Tv },
    { id: Category.GAME, label: '遊戲', icon: Gamepad2 },
    { id: Category.DRAMA_SERIES, label: '劇集', icon: Clapperboard },
  ];

  const ratingOptions = [
    { id: 'ALL', label: '所有等級', emoji: '' },
    { id: Rating.BIBLE, label: '聖經', emoji: '👑' },
    { id: Rating.TOP_TIER, label: '極品', emoji: '🌹' },
    { id: Rating.DESTINY, label: '頂級', emoji: '✨' },
   { id: Rating.EXCELLENT, label: '優質', emoji: '🍵' },
    { id: Rating.ORDINARY, label: '普通', emoji: '☕' },
    { id: Rating.MYSTERIOUS, label: '神秘', emoji: '🔮' },
  ];

  const sortOptions = [
    { id: 'date-desc', label: '由新到舊' },
    { id: 'date-asc', label: '由舊到新' },
    { id: 'rating-desc', label: '由高到低' },
    { id: 'rating-asc', label: '由低到高' },
  ];

  return (
    <div className="flex min-h-screen w-full bg-earth-50 dark:bg-[#191919] transition-colors duration-300 font-sans">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="flex justify-between items-center px-6 py-4 z-20">
            <button onClick={() => setSidebarOpen(true)} className="p-2 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg"><Menu size={20} /></button>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 text-stone-500 rounded-full hover:bg-stone-100">{isDarkMode ? <Sun size={20} /> : <Moon size={20} />}</button>
        </header>

        <main className="flex-1 overflow-y-auto px-4 md:px-12 pb-12 custom-scrollbar">
          <div className="max-w-6xl mx-auto w-full">
            
            <section className="text-center mb-16 mt-4">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-[10px] tracking-widest text-stone-500 dark:text-stone-400 font-bold uppercase mb-6">
               <Heart size={10} className="text-rose-400 fill-rose-400" />
                Lily Garden Library
              </div>
              <h1 className="text-4xl md:text-5xl font-serif font-medium text-eart-800 dark:text-stone-100 mb-4 tracking-tight">百合圖書與電影</h1>
              <p className="text-lg text-earth-500 dark:text-stone-400 italic font-serif mb-8">天から落ちて来る星の破片を墓標に置いて下さい</p>
              
              {/* 使用指南方塊 */}
              <div className="max-w-3xl mx-auto bg-stone-100/30 dark:bg-stone-800/30 p-8 rounded-xl border border-stone-200/60 dark:border-stone-700/60 shadow-sm">
                <div className="font-bold text-stone-700 dark:text-stone-200 mb-3 text-base">使用指南 🗡️</div>
              {/* 感想描述區域：分兩行呈現 */}
                <div className="text-stone-500 text-sm text-center leading-relaxed mb-6">
                  <p>純粹只是一部分的個人感受，如果電波不同則完全沒有意義。</p>
                  <p>以暴雷的前提在寫感想，而且一點營養也沒有。</p>
                  <p>綜合而論，優質以上都很值得一看。</p>
                </div>
                
                <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[13px] border-t border-stone-200/60 pt-5">
                  <span><b>聖經</b>：某種神的旨意</span>
                  <span><b>極品</b>：印象深刻且強勁或全方位優質</span>
                  <span><b>頂級</b>：難能可貴</span>
                  <span><b>優質</b>：不錯</span>
                  <span><b>神秘</b>：沒有緣分</span>
                </div>
              </div>
            </section>


            <div className="sticky top-0 z-10 bg-earth-50/95 dark:bg-[#191919]/95 backdrop-blur-sm py-5 mb-8 border-b border-stone-200/60">
              <div className="flex flex-nowrap items-center gap-x-3 w-full">
                
                <div className="flex items-center gap-1">
                  {categoriesList.map(cat => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button key={cat.id} onClick={() => setSelectedCategory(cat.id as any)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm whitespace-nowrap transition-all border 
                          ${isSelected 
                            ? (isDarkMode ? 'bg-[#333333] border-stone-500 text-white' : 'bg-white border-stone-300 text-stone-800 shadow-sm') 
                            : 'border-transparent text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800'}`}
                      >
                        <cat.icon size={15} /> <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="h-6 w-px bg-stone-200 dark:bg-stone-700 flex-shrink-0" />

                {/* --- 【重點 1】：等級下拉按鈕修正 --- */}
                <div className="relative flex-shrink-0" ref={ratingDropdownRef}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setIsRatingDropdownOpen(!isRatingDropdownOpen); }} 
                    className="flex items-center gap-1 px-2 py-1.5 text-sm text-stone-500 hover:text-stone-800 transition-colors"
                  >
                    <span>{ratingOptions.find(o => o.id === selectedRating)?.label}</span>
                    <ChevronDown size={14} className={isRatingDropdownOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
                  </button>
                  {isRatingDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-44 bg-white border border-stone-100 shadow-xl rounded-lg z-50 overflow-hidden">
                      {ratingOptions.map(o => (
                        <button key={o.id} 
                          onClick={() => { setSelectedRating(o.id as any); setIsRatingDropdownOpen(false); }} 
                          className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${selectedRating === o.id ? 'bg-blue-50 text-blue-600' : 'hover:bg-stone-50 text-stone-600'}`}
                        >
                          <span className="text-base">{o.emoji}</span><span>{o.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex-1 relative min-w-[150px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-300" size={16} />
                  <input type="text" placeholder="搜尋標題、作者..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-white dark:bg-stone-800 border border-stone-200/60 rounded-md text-sm outline-none focus:border-stone-400" />
                </div>

                <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-1.5 px-4 py-2 bg-[#5e5045] text-white rounded-md text-sm font-bold shadow-sm hover:bg-[#4a403a] flex-shrink-0 whitespace-nowrap">
                  <Plus size={18} /><span>新增</span>
                </button>

                {/* --- 【重點 1】：排序按鈕按鈕修正 --- */}
                <div className="relative flex-shrink-0" ref={sortDropdownRef}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setIsSortDropdownOpen(!isSortDropdownOpen); }} 
                    className="flex items-center gap-1.5 px-2 py-2 text-stone-500 hover:text-stone-800 text-sm transition-colors"
                  >
                    <ArrowUpDown size={15} />
                    <span className="font-medium">{sortOptions.find(o => o.id === sortBy)?.label}</span>
                    <ChevronDown size={14} className={isSortDropdownOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
                  </button>
                  {isSortDropdownOpen && (
                    <div className="absolute top-full right-0 mt-1 w-40 bg-white border border-stone-100 shadow-xl rounded-lg z-50 overflow-hidden">
                      {sortOptions.map(o => (
                        <button key={o.id} 
                          onClick={() => { setSortBy(o.id as any); setIsSortDropdownOpen(false); }} 
                          className={`w-full text-left px-4 py-2.5 text-sm flex justify-between items-center transition-colors ${sortBy === o.id ? 'bg-stone-50 text-stone-900 font-bold' : 'text-stone-500 hover:bg-stone-50'}`}
                        >
                          <span>{o.label}</span>
                          {sortBy === o.id && <Check size={14} className="text-stone-400" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>

        
            {/* ★★★ 【功能新增：顯示目前篩選中的標籤】 */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-6 animate-in fade-in">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mr-2">正在篩選標籤:</span>
                {selectedTags.map(tag => (
                  <button key={tag} onClick={() => toggleTag(tag)} className="flex items-center gap-1.5 px-3 py-1 bg-[#8c7b6d] text-white rounded-full text-xs font-bold transition-all">#{tag} <X size={12} /></button>
                ))}
                <button onClick={() => setSelectedTags([])} className="text-[10px] text-stone-400 hover:text-rose-500 font-bold underline ml-2">清除所有</button>
              </div>
            )}
            
           {/* 卡片區域：改用分頁後的 paginatedEntries */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {paginatedEntries.map((entry) => (
                <div key={entry.id} onClick={() => { setExpandedEntry(entry); setIsEditingExpanded(false); }} className="flex bg-white dark:bg-[#202020] rounded-lg overflow-hidden border border-stone-100 dark:border-stone-800 shadow-soft hover:shadow-md transition-all cursor-pointer group h-48 relative text-left">
                  <div className="w-32 bg-stone-100 flex-shrink-0 relative overflow-hidden">
                     {/* ★★★ 修改 1：加入強制硬體加速與平滑化樣式 */}
                     <img 
                        src={entry.coverUrl} 
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity transform-gpu" 
                        alt={entry.title} 
                        loading="lazy" 
                        // ★★★ 修改 2：增加內聯樣式提升渲染品質
                        style={{ 
                          imageRendering: 'auto', 
                          backfaceVisibility: 'hidden',
                          transform: 'translateZ(0)' 
                        }}
                     />
                  </div>
                  <div className="flex-1 p-5 flex flex-col justify-between overflow-hidden">
                    <div>
                      <div className="flex justify-between items-start mb-1 text-left">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">{CATEGORY_DISPLAY_MAP[entry.category]}</div>
                        <span className={`text-[10px] px-2 py-0.5 rounded border ${RATING_STYLES[entry.rating]}`}>{entry.rating}</span>
                      </div>
                      <h3 className="text-xl font-serif font-bold text-stone-800 dark:text-stone-100 mb-1 leading-tight line-clamp-1">{entry.title}</h3>
                      <p className="text-xs text-stone-500 mb-2 text-left">by {entry.author}</p>
                      {entry.note && <p className="text-sm text-stone-600 dark:text-stone-400 italic line-clamp-2 leading-relaxed text-left whitespace-pre-wrap">"{entry.note}"</p>}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {entry.tags?.slice(0, 6).map(tag => (
                        <span key={tag} onClick={(e) => { e.stopPropagation(); toggleTag(tag); }} className={`text-[10px] px-2 py-0.5 rounded transition-colors ${selectedTags.includes(tag) ? 'bg-[#8c7b6d] text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-600 hover:bg-stone-200'}`}>#{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

 {/* ★★★ 分頁控制 UI */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-12 mb-8">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-full border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-30 transition-all shadow-sm dark:bg-stone-800 dark:border-stone-700"
                >
                  <ChevronLeft size={20} className="text-stone-600 dark:text-stone-300" />
                </button>
                <div className="flex gap-1.5">
                  {[...Array(totalPages)].map((_, i) => (
                    <button 
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-10 h-10 rounded-full text-sm font-bold transition-all border
                        ${currentPage === i + 1 
                          ? 'bg-[#8c7b6d] border-[#8c7b6d] text-white shadow-md' 
                          : 'bg-white border-stone-200 text-stone-500 hover:border-stone-400 dark:bg-stone-800 dark:border-stone-700'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-full border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-30 transition-all shadow-sm dark:bg-stone-800 dark:border-stone-700"
                >
                  <ChevronRight size={20} className="text-stone-600 dark:text-stone-300" />
                </button>
              </div>
            )}
            
            <footer className="mt-20 pb-12">
              <div className="bg-[#8b5e3c] dark:bg-stone-800 rounded-2xl p-8 md:p-12 text-center text-white relative shadow-xl overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-3xl font-serif font-medium mb-4 tracking-widest text-white">撒下的百合花</h3>
                  <p className="text-sm opacity-90 mb-10 text-white font-light">儘量記錄看過的作品，留存當下的情緒</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                    {[ { v: entries.length, l: '總收藏' }, { v: entries.filter(e => e.category === Category.MANGA).length, l: '漫畫' }, { v: entries.filter(e => e.category === Category.NOVEL).length, l: '小說' }, { v: entries.filter(e => e.category === Category.MOVIE).length, l: '電影' } ].map(s => (
                      <div key={s.l} className="bg-white/10 rounded-xl p-6 border border-white/10 backdrop-blur-sm flex flex-col items-center justify-center h-32">
                        <div className="text-4xl font-bold font-sans mb-1 leading-none text-white">{s.v}</div><div className="text-[11px] uppercase tracking-widest opacity-70 text-white">{s.l}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
              </div>
            </footer>
          </div>
        </main>
      </div>

      <AddEntryModal isOpen={isModalOpen} onClose={() => {setIsModalOpen(false); setEditingEntry(null);}} onRefresh={fetchEntries} entry={editingEntry} />
      
     {/* ★★★ 【核心修改：大卡片 - 加入完整原地編輯功能】 */}
      {expandedEntry && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in" onClick={() => { if(!isEditingExpanded) setExpandedEntry(null); }} />
          <div className="relative bg-[#fbf7f3] dark:bg-[#1a1917] rounded-3xl overflow-hidden max-w-[950px] w-full shadow-2xl flex flex-col md:flex-row max-h-[90vh] animate-in zoom-in-95 border border-stone-200">
             <button onClick={() => setExpandedEntry(null)} className="absolute top-6 right-6 p-2 bg-white/90 dark:bg-stone-800 rounded-full z-10 shadow-md hover:scale-110 transition-transform"><X size={20} /></button>
               {/* ★★★ 重點 1：圖片容器改為 object-contain 防止切圖 --- */}
             <div className="md:w-[45%] bg-stone-200/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                <img src={expandedEntry.coverUrl} className="w-full h-full object-contain" alt="" />
             </div>
             
   {/* ★★★ 重點 4：右側加入捲軸控制 overflow-y-auto */}
             <div className="flex-1 p-8 md:p-14 flex flex-col justify-between overflow-y-auto custom-scrollbar text-left text-stone-800 dark:text-stone-100">
                {isEditingExpanded ? (
                  /* --- 完整編輯模式介面 (比照截圖排列) --- */
                  <div className="space-y-5">
                    <h2 className="text-xl font-bold text-stone-400 uppercase tracking-widest mb-4">原地編輯資料</h2>
                    
                    {/* 第一排：標題與作者 */}
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-[10px] font-bold text-stone-400 block mb-1 uppercase tracking-widest">標題</label><input className="w-full p-2.5 bg-white text-stone-800 border border-stone-200 rounded-xl outline-none focus:border-[#8c7b6d]" defaultValue={expandedEntry.title} onChange={e => setEditForm({...editForm, title: e.target.value})} /></div>
                      <div><label className="text-[10px] font-bold text-stone-400 block mb-1 uppercase tracking-widest">作者</label><input className="w-full p-2.5 bg-white text-stone-800 border border-stone-200 rounded-xl outline-none focus:border-[#8c7b6d]" defaultValue={expandedEntry.author} onChange={e => setEditForm({...editForm, author: e.target.value})} /></div>
                    </div>

                    {/* 第二排：封面網址與噗浪網址 */}
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="text-[10px] font-bold text-stone-400 block mb-1 uppercase tracking-widest">封面圖片網址</label><input className="w-full p-2.5 bg-white text-stone-800 border border-stone-200 rounded-xl outline-none" defaultValue={expandedEntry.coverUrl} onChange={e => setEditForm({...editForm, coverUrl: e.target.value})} /></div>
                      <div><label className="text-[10px] font-bold text-stone-400 block mb-1 uppercase tracking-widest">Plurk 網址</label><input className="w-full p-2.5 bg-white text-stone-800 border border-stone-200 rounded-xl outline-none" defaultValue={expandedEntry.plurkUrl} onChange={e => setEditForm({...editForm, plurkUrl: e.target.value})} /></div>
                    </div>

                    {/* 第三排：分類與評價下拉選單 */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-stone-400 block mb-1 uppercase tracking-widest">分類</label>
                        <select className="w-full p-2.5 bg-white text-stone-800 border border-stone-200 rounded-xl outline-none appearance-none cursor-pointer" defaultValue={expandedEntry.category} onChange={e => setEditForm({...editForm, category: e.target.value as Category})}>
                           {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-stone-400 block mb-1 uppercase tracking-widest">心中定位</label>
                        <select className="w-full p-2.5 bg-white text-stone-800 border border-stone-200 rounded-xl outline-none appearance-none cursor-pointer" defaultValue={expandedEntry.rating} onChange={e => setEditForm({...editForm, rating: e.target.value as Rating})}>
                           {Object.values(Rating).map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* 第四排：標籤輸入 (空格分隔) */}
                    <div>
                      <label className="text-[13px] font-bold text-stone-400 block mb-1 uppercase tracking-widest">標籤 (空格分隔)</label>
                      <input className="w-full p-2.5 bg-white text-stone-800 border border-stone-200 rounded-xl outline-none" defaultValue={expandedEntry.tags?.join(' ')} onChange={e => setEditForm({...editForm, tags: e.target.value as any})} />
                    </div>

                    {/* 第五排：心得 */}
                    <div><label className="text-[10px] font-bold text-stone-400 block mb-1 uppercase tracking-widest">感想</label><textarea className="w-full p-2.5 bg-white text-stone-800 border border-stone-200 rounded-xl h-24 outline-none resize-none focus:border-[#8c7b6d]" defaultValue={expandedEntry.note} onChange={e => setEditForm({...editForm, note: e.target.value})} /></div>
                    
                    {/* 按鈕區 */}
                    <div className="flex gap-3 pt-2">
                      <button onClick={handleInlineSave} className="flex-1 py-3 bg-[#8c7b6d] text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"><Save size={18}/>儲存更改 (需密碼)</button>
                      <button onClick={() => setIsEditingExpanded(false)} className="px-8 py-3 bg-stone-100 dark:bg-stone-800 text-stone-500 rounded-2xl font-bold">取消</button>
                    </div>
                  </div>
                ) : (
                  /* --- 顯示模式 (原設計) --- */
                  <div className="flex flex-col h-full justify-between">
                    <div>
                      <div className="flex gap-3 mb-8">
                        <span className="px-4 py-1 rounded-full border border-stone-200 text-[11px] font-bold text-stone-400 bg-white dark:bg-stone-800 tracking-wider">{CATEGORY_DISPLAY_MAP[expandedEntry.category]}</span>
                        <span className={`px-4 py-1 rounded-full border text-[11px] font-bold tracking-wider ${RATING_STYLES[expandedEntry.rating]}`}>{expandedEntry.rating}</span>
                      </div>
                      <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-800 dark:text-stone-100 mb-3 tracking-tight">{expandedEntry.title}</h2>
                      <p className="text-xl text-stone-400 italic font-serif mb-12 text-left">by <span className="text-stone-500">{expandedEntry.author}</span></p>
                         {/* ★★★ 重點 6：分段顯示 whitespace-pre-wrap 且非斜體 */}
                      {expandedEntry.note && (
                        <div className="relative pl-10 mb-12 border-l border-stone-200">
                          <p className="text-lg text-stone-600 dark:text-stone-400 font-serif leading-relaxed text-left whitespace-pre-wrap">
                            {expandedEntry.note}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-8 border-t border-stone-100">
                      <div className="flex flex-wrap gap-2">
                        {expandedEntry.tags?.map(t => <span key={t} onClick={() => { toggleTag(t); setExpandedEntry(null); }} className={`px-3 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors ${selectedTags.includes(t) ? 'bg-[#8c7b6d] text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-500 hover:bg-stone-200'}`}>#{t}</span>)}
                      </div>
                      <div className="flex items-center gap-5 text-stone-300">
                        {expandedEntry.plurkUrl && <a href={expandedEntry.plurkUrl} target="_blank" rel="noopener noreferrer" className="hover:text-stone-800 transition-colors"><PlurkPIcon size={20} /></a>}
                        <button onClick={() => { setEditForm(expandedEntry); setIsEditingExpanded(true); }} className="hover:text-stone-800 transition-colors flex items-center gap-1 text-sm font-bold"><Edit2 size={16} />編輯</button>
                        <button onClick={() => handleDelete(expandedEntry.id)} className="hover:text-rose-500 transition-colors flex items-center gap-1 text-sm font-bold"><Trash2 size={16} />刪除</button>
                      </div>
                    </div>
                  </div>
                )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
