import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Menu, Moon, Sun, Search, Plus, Heart, ChevronDown, Check, LayoutGrid, BookOpen, Book, Film, Tv, Gamepad2, Info, Loader2, ArrowUpDown, Clapperboard, Sparkles, X, Edit2, Trash2, MessageSquareText, ExternalLink, MessageCircle } from 'lucide-react';
import { Category, Entry, RATING_STYLES, RATING_WEIGHTS, Rating, CATEGORY_STYLES, CATEGORY_DISPLAY_MAP } from './types';
import Sidebar from './components/Sidebar';
import AddEntryModal from './components/AddEntryModal';

// Custom Monochromatic "P" Icon for Plurk
const PlurkPIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg 
    width={size} height={size} viewBox="0 0 24 24" fill="none" 
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
    className={className}
  >
    <path d="M8 21V5h6a5 5 0 0 1 0 10H8" />
  </svg>
);

type SortOption = 'date-desc' | 'date-asc' | 'rating-desc' | 'rating-asc';

const App: React.FC = () => {
  // --- State Management ---
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
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [expandedEntry, setExpandedEntry] = useState<Entry | null>(null);
  const [isRatingDropdownOpen, setIsRatingDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  
  const ratingDropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Sample entries for all categories when DB is empty
  const sampleEntries: Entry[] = useMemo(() => [
    {
      id: 'sample-manga',
      title: '終將成為妳 (範例)',
      author: '仲谷鳰',
      category: Category.MANGA,
      rating: Rating.BIBLE,
      coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=200&h=300',
      note: '細膩描繪「喜歡」的本質。這是一個 Manga 分類的範例卡片。',
      tags: ['校園', '百合', '成長'],
      plurkUrl: 'https://www.plurk.com',
      createdAt: Date.now() - 1000
    },
    {
      id: 'sample-novel',
      title: '安達與島村 (範例)',
      author: '入間人間',
      category: Category.NOVEL,
      rating: Rating.TOP_TIER,
      coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=200&h=300',
      note: '緩慢而溫柔的情感流動。這是一個 Novel 分類的範例卡片。',
      tags: ['輕小說', '日常'],
      plurkUrl: 'https://www.plurk.com',
      createdAt: Date.now() - 2000
    },
    {
      id: 'sample-movie',
      title: '燃燒女子的畫像 (範例)',
      author: '瑟琳·席安瑪',
      category: Category.MOVIE,
      rating: Rating.BIBLE,
      coverUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=200&h=300',
      note: '凝視與被凝視的藝術。這是一個 Movie 分類的範例卡片。',
      tags: ['法國', '藝術'],
      plurkUrl: 'https://www.plurk.com',
      createdAt: Date.now() - 3000
    },
    {
      id: 'sample-anime',
      title: '利茲與青鳥 (範例)',
      author: '山田尚子',
      category: Category.ANIMATION,
      rating: Rating.TOP_TIER,
      coverUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=200&h=300',
      note: '吹響吧！上低音號外傳。這是一個 Animation 分類的範例卡片。',
      tags: ['音樂', '唯美'],
      plurkUrl: 'https://www.plurk.com',
      createdAt: Date.now() - 4000
    },
    {
      id: 'sample-game',
      title: '符文工廠 5 (範例)',
      author: 'Marvelous',
      category: Category.GAME,
      rating: Rating.ORDINARY,
      coverUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=200&h=300',
      note: '奇幻經營與冒險。這是一個 Game 分類的範例卡片。',
      tags: ['RPG', '經營'],
      plurkUrl: 'https://www.plurk.com',
      createdAt: Date.now() - 5000
    },
    {
      id: 'sample-series',
      title: '第一次遇見花香的那刻 (範例)',
      author: '鄧依涵',
      category: Category.DRAMA_SERIES,
      rating: Rating.TOP_TIER,
      coverUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&q=80&w=200&h=300',
      note: '台灣拉劇經典。這是一個 Series 分類的範例卡片。',
      tags: ['台劇', '成人'],
      plurkUrl: 'https://www.plurk.com',
      createdAt: Date.now() - 6000
    },
    {
      id: 'sample-gay',
      title: 'GAY 作品登記 (範例)',
      author: 'GAY 創作者',
      category: Category.GAY,
      rating: Rating.DESTINY,
      coverUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=200&h=300',
      note: '專屬特別分類。這是一個 GAY 分類的範例卡片。',
      tags: ['特別', '獨家'],
      plurkUrl: 'https://www.plurk.com',
      createdAt: Date.now() - 7000
    }
  ], []);

  // --- Data Fetching ---
  const fetchEntries = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/get');
      if (response.ok) {
        const data = await response.json();
        setEntries(data);
      }
    } catch (err) {
      console.error('Failed to fetch entries:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  // --- Theme ---
  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ratingDropdownRef.current && !ratingDropdownRef.current.contains(event.target as Node)) {
        setIsRatingDropdownOpen(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setIsSortDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // --- Filter & Sort Logic ---
  const processedEntries = useMemo(() => {
    const baseEntries = (entries.length === 0 && !isLoading) ? sampleEntries : entries;

    let result = baseEntries.filter(entry => {
      const matchesCategory = selectedCategory === 'ALL' || entry.category === selectedCategory;
      const matchesRating = selectedRating === 'ALL' || entry.rating === selectedRating;
      const matchesSearch = 
        entry.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        entry.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (entry.note && entry.note.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (entry.tags && entry.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())));
      
      return matchesCategory && matchesRating && matchesSearch;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'date-desc') return b.createdAt - a.createdAt;
      if (sortBy === 'date-asc') return a.createdAt - b.createdAt;
      if (sortBy === 'rating-desc') return RATING_WEIGHTS[b.rating] - RATING_WEIGHTS[a.rating];
      if (sortBy === 'rating-asc') return RATING_WEIGHTS[a.rating] - RATING_WEIGHTS[b.rating];
      return 0;
    });

    return result;
  }, [entries, isLoading, selectedCategory, selectedRating, searchTerm, sortBy, sampleEntries]);

  // --- Actions ---
  const handleEdit = (entry: Entry) => {
    if (entry.id.startsWith('sample-')) {
      alert('這是範例作品，您可以直接新增自己的作品！');
      return;
    }
    setEditingEntry(entry);
    setIsModalOpen(true);
  };

  const handleDelete = async (entryId: string) => {
    if (entryId.startsWith('sample-')) {
      alert('範例作品無法刪除。');
      return;
    }

    const password = prompt('請輸入管理員密碼以確認刪除：');
    if (!password) return;

    if (!confirm('確定要刪除此作品登記嗎？')) return;

    try {
      const response = await fetch('/api/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: entryId, password }),
      });

      if (response.ok) {
        alert('刪除成功');
        setExpandedEntry(null);
        fetchEntries();
      } else {
        const error = await response.json();
        alert(error.error || '刪除失敗');
      }
    } catch (err) {
      alert('發生錯誤');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEntry(null);
  };

  const stats = useMemo(() => ({
    total: entries.length,
    manga: entries.filter(e => e.category === Category.MANGA).length,
    novel: entries.filter(e => e.category === Category.NOVEL).length,
    movie: entries.filter(e => e.category === Category.MOVIE).length
  }), [entries]);

  const categoriesList = [
    { id: 'ALL', label: '全部', icon: LayoutGrid },
    { id: Category.MANGA, label: '漫畫', icon: BookOpen },
    { id: Category.NOVEL, label: '小說', icon: Book },
    { id: Category.MOVIE, label: '電影', icon: Film },
    { id: Category.ANIMATION, label: '動畫', icon: Tv },
    { id: Category.GAME, label: '遊戲', icon: Gamepad2 },
    { id: Category.DRAMA_SERIES, label: '劇集', icon: Clapperboard },
  ];

  const sortOptions = [
    { id: 'date-desc', label: '由新到舊' },
    { id: 'date-asc', label: '由舊到新' },
    { id: 'rating-desc', label: '心中地位 (高至低)' },
    { id: 'rating-asc', label: '心中地位 (低至高)' },
  ];

  const ratingOptions = [
    { id: 'ALL', label: '所有等級', icon: '' },
    { id: Rating.BIBLE, label: '聖經', icon: '👑' },
    { id: Rating.TOP_TIER, label: '極品', icon: '🌹' },
    { id: Rating.DESTINY, label: '頂級', icon: '✨' },
    { id: Rating.ORDINARY, label: '普通', icon: '☕' },
    { id: Rating.MYSTERIOUS, label: '神秘', icon: '🔮' },
  ];

  return (
    <div className="flex min-h-screen w-full overflow-hidden bg-earth-50 dark:bg-[#191919] transition-colors duration-300 font-sans">
      
      <Sidebar 
        isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} 
        selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div className="flex justify-between items-center px-6 py-4 z-20">
            <button onClick={() => setSidebarOpen(true)} className="p-2 text-earth-600 dark:text-earth-300 hover:bg-earth-200 dark:hover:bg-stone-800 rounded-lg transition-colors">
              <Menu size={20} />
            </button>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full hover:bg-earth-200 dark:hover:bg-stone-800 text-earth-600 dark:text-earth-300 transition-colors">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
        </div>

        <main className="flex-1 overflow-y-auto px-4 md:px-12 pb-12 custom-scrollbar">
          <div className="max-w-6xl mx-auto w-full">
            
            <section className="text-center mb-16 mt-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-[10px] tracking-widest text-stone-500 dark:text-stone-400 font-bold uppercase mb-6">
                <Heart size={10} className="text-rose-400 fill-rose-400" />
                Lily Garden Library
              </div>
              <h1 className="text-4xl md:text-5xl font-serif font-medium text-earth-800 dark:text-earth-100 mb-4 tracking-tight">百合圖書與電影</h1>
              <p className="text-lg text-earth-500 dark:text-stone-400 italic font-serif mb-8">天から落ちて来る星的破片を墓標に置いて下さい</p>
              
              <div className="max-w-3xl mx-auto bg-stone-100 dark:bg-stone-800/50 p-6 rounded-xl border border-stone-200 dark:border-stone-700 text-sm text-earth-600 dark:text-stone-400 leading-relaxed shadow-sm">
                <div className="flex items-center justify-center gap-2 font-bold text-stone-700 dark:text-stone-200 mb-3 text-base">
                   <span>使用指南🗡️</span>
                </div>
                <p className="mb-4 text-center">純粹只是一部分的個人感受，如果電波不同則完全沒有意義。</p>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[13px] border-t border-stone-200 dark:border-stone-700 pt-4">
                  <span className="flex items-center gap-1"><b className="text-stone-800 dark:text-stone-300">聖經</b>: 某種神的旨意</span>
                  <span className="flex items-center gap-1"><b className="text-stone-800 dark:text-stone-300">極品</b>: 印象深刻且強勁或全方位優質</span>
                  <span className="flex items-center gap-1"><b className="text-stone-800 dark:text-stone-300">頂級</b>: 難能可貴</span>
                  <span className="flex items-center gap-1"><b className="text-stone-800 dark:text-stone-300">普通</b>: 普通</span>
                  <span className="flex items-center gap-1"><b className="text-stone-800 dark:text-stone-300">神秘</b>: 沒有緣分</span>
                </div>
              </div>
            </section>

            {/* Toolbar */}
            <div className="sticky top-0 z-10 bg-earth-50/95 dark:bg-[#191919]/95 backdrop-blur-sm py-4 mb-8 border-b border-earth-200 dark:border-stone-800">
              <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
                <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
                  <div className="flex items-center gap-1 overflow-x-auto pb-2 xl:pb-0 hide-scrollbar max-w-full">
                    {categoriesList.map(cat => {
                      const Icon = cat.icon;
                      const isSelected = selectedCategory === cat.id;
                      
                      return (
                        <button 
                          key={cat.id} onClick={() => setSelectedCategory(cat.id as Category | 'ALL')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm whitespace-nowrap transition-all border 
                            ${isSelected 
                              ? 'bg-white dark:bg-stone-800 border-stone-300 dark:border-stone-600 text-earth-800 dark:text-stone-100 shadow-sm font-medium'
                              : 'border-transparent text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800'
                            }
                          `}
                        >
                          <Icon size={16} strokeWidth={isSelected ? 2 : 1.5} />
                          <span>{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="hidden sm:block h-6 w-px bg-stone-300 dark:bg-stone-700 mx-2"></div>
                  
                  {/* Rating Dropdown */}
                  <div className="relative" ref={ratingDropdownRef}>
                    <button onClick={() => setIsRatingDropdownOpen(!isRatingDropdownOpen)} className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm whitespace-nowrap transition-all border ${isRatingDropdownOpen || selectedRating !== 'ALL' ? 'bg-white dark:bg-stone-800 border-stone-300 dark:border-stone-600 text-earth-800 dark:text-stone-100 shadow-sm' : 'border-transparent text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800'}`}>
                      <span>{ratingOptions.find(o => o.id === selectedRating)?.label || '所有等級'}</span>
                      <ChevronDown size={14} className={`transition-transform duration-200 ${isRatingDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isRatingDropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-stone-800 rounded-md shadow-xl border border-stone-200 dark:border-stone-700 py-1 z-50 animate-in fade-in zoom-in-95 duration-100 overflow-hidden">
                         {ratingOptions.map((option) => (
                           <button key={option.id} onClick={() => { setSelectedRating(option.id as Rating | 'ALL'); setIsRatingDropdownOpen(false); }}
                             className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 transition-colors ${selectedRating === option.id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300' : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700/50'}`}
                           >
                             <span className="w-5 text-center text-base">{option.icon}</span>
                             <span className="flex-1 font-medium">{option.label}</span>
                             {selectedRating === option.id && <Check size={14} />}
                           </button>
                         ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full xl:w-auto mt-2 xl:mt-0 flex-nowrap">
                  <div className="flex-1 xl:w-48 relative group min-w-[120px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-stone-600 transition-colors" size={14} />
                    <input type="text" placeholder="搜尋..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded text-sm outline-none focus:border-stone-400 dark:focus:border-stone-500 transition-colors placeholder:text-stone-300" />
                  </div>
                  
                  <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-1.5 px-4 py-1.5 bg-[#5e5045] dark:bg-stone-700 text-white rounded text-sm hover:bg-[#4a403a] dark:hover:bg-stone-600 transition-colors whitespace-nowrap shadow-sm shrink-0">
                    <Plus size={16} /> <span>新增</span>
                  </button>

                  <div className="relative shrink-0" ref={sortDropdownRef}>
                    <button onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm whitespace-nowrap transition-all border ${isSortDropdownOpen ? 'bg-white dark:bg-stone-800 border-stone-300 dark:border-stone-600 text-earth-800 dark:text-stone-100 shadow-sm' : 'border-transparent text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800'}`}>
                      <ArrowUpDown size={14} />
                      <span className="hidden sm:inline">{sortOptions.find(o => o.id === sortBy)?.label || '排序'}</span>
                      <ChevronDown size={14} className={`transition-transform duration-200 ${isSortDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isSortDropdownOpen && (
                      <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-stone-800 rounded-md shadow-xl border border-stone-200 dark:border-stone-700 py-1 z-50 animate-in fade-in zoom-in-95 duration-100 overflow-hidden">
                         {sortOptions.map((option) => (
                           <button key={option.id} onClick={() => { setSortBy(option.id as SortOption); setIsSortDropdownOpen(false); }}
                             className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 transition-colors ${sortBy === option.id ? 'bg-stone-100 dark:bg-stone-700 text-stone-900 dark:text-white font-medium' : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700/50'}`}
                           >
                             <span className="flex-1">{option.label}</span>
                             {sortBy === option.id && <Check size={14} />}
                           </button>
                         ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Grid Content */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-32 text-stone-400">
                <Loader2 size={32} className="animate-spin mb-4" />
                <p>正在從資料庫同步...</p>
              </div>
            ) : processedEntries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-stone-400">
                <Search size={32} className="mb-4 opacity-50" />
                <p>目前的搜尋條件沒有相符的作品...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {processedEntries.map((entry) => (
                  <div 
                    key={entry.id} 
                    onClick={() => setExpandedEntry(entry)}
                    className="flex bg-white dark:bg-[#202020] rounded-lg overflow-hidden border border-stone-100 dark:border-stone-800 shadow-soft hover:shadow-md transition-all cursor-pointer group h-48 relative"
                  >
                    <div className="w-32 bg-stone-100 dark:bg-stone-900 flex-shrink-0 relative overflow-hidden">
                       <img src={entry.coverUrl} alt={entry.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex-1 p-5 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-1">
                          <div className={`text-[10px] font-bold uppercase tracking-wider ${CATEGORY_STYLES[entry.category] || CATEGORY_STYLES.DEFAULT}`}>
                            {CATEGORY_DISPLAY_MAP[entry.category]}
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded border ${RATING_STYLES[entry.rating]}`}>{entry.rating}</span>
                        </div>
                        <h3 className="text-xl font-serif font-bold text-stone-800 dark:text-stone-100 mb-1 leading-tight line-clamp-1">{entry.title}</h3>
                        <p className="text-xs text-stone-500 mb-3">by {entry.author}</p>
                        {entry.note && <p className="text-sm text-stone-600 dark:text-stone-400 italic line-clamp-2 leading-relaxed">"{entry.note}"</p>}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {entry.tags?.slice(0, 3).map(tag => <span key={tag} className="text-[10px] bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 px-2 py-0.5 rounded">#{tag}</span>)}
                      </div>
                    </div>
                    
                    {entry.id.startsWith('sample-') && (
                      <div className="absolute top-0 left-0 bg-stone-800/80 text-white text-[9px] px-2 py-0.5 font-bold uppercase tracking-tighter rounded-br backdrop-blur-sm">
                        PREVIEW
                      </div>
                    )}
                    
                    {/* Direct Plurk Link Icon (Grid view) - Custom Monochromatic P */}
                    {entry.plurkUrl && (
                      <a 
                        href={entry.plurkUrl} target="_blank" rel="noopener noreferrer" 
                        onClick={e => e.stopPropagation()}
                        className="absolute bottom-2 right-2 text-earth-300 dark:text-stone-500 hover:text-earth-500 transition-colors p-1"
                        title="查看噗文"
                      >
                        <PlurkPIcon size={16} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Immersive Expanded View Modal */}
            {expandedEntry && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 lg:p-12">
                <div className="absolute inset-0 bg-black/75 backdrop-blur-md animate-in fade-in duration-500" onClick={() => setExpandedEntry(null)} />
                <div className="relative bg-[#fbf7f3] dark:bg-[#1a1917] rounded-3xl overflow-hidden max-w-[1000px] w-full shadow-2xl animate-in zoom-in-95 duration-300 border border-stone-200 dark:border-stone-800 flex flex-col md:flex-row max-h-[90vh] overflow-y-auto">
                  
                  {/* Close button */}
                  <button onClick={() => setExpandedEntry(null)} className="absolute top-6 right-6 p-3 rounded-full bg-white/90 dark:bg-stone-800/90 text-stone-800 dark:text-white shadow-lg hover:scale-110 transition-transform z-30">
                    <X size={24} />
                  </button>

                  {/* Left: Image */}
                  <div className="md:w-1/2 aspect-[3/4] md:aspect-auto bg-stone-100 dark:bg-stone-900">
                     <img src={expandedEntry.coverUrl} alt={expandedEntry.title} className="w-full h-full object-cover" />
                  </div>

                  {/* Right: Content & Actions */}
                  <div className="flex-1 p-8 md:p-12 lg:p-16 flex flex-col justify-between bg-white dark:bg-[#1c1c1a]">
                    <div className="mb-10">
                      <div className="flex gap-4 items-center mb-8">
                        <span className={`text-[11px] font-bold uppercase tracking-[0.25em] px-4 py-1.5 rounded-full border ${CATEGORY_STYLES[expandedEntry.category] || CATEGORY_STYLES.DEFAULT}`}>
                          {CATEGORY_DISPLAY_MAP[expandedEntry.category]}
                        </span>
                        <span className={`text-[11px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border ${RATING_STYLES[expandedEntry.rating]}`}>
                          {expandedEntry.rating}
                        </span>
                      </div>
                      
                      <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-stone-800 dark:text-stone-100 mb-4 leading-tight">
                        {expandedEntry.title}
                      </h2>
                      <p className="text-xl md:text-2xl text-stone-500 mb-10 font-serif italic">by {expandedEntry.author}</p>
                      
                      <div className="h-px w-24 bg-stone-200 dark:bg-stone-800 mb-10" />
                      
                      {expandedEntry.note && (
                        <div className="text-stone-600 dark:text-stone-400 italic text-xl leading-relaxed mb-10 font-serif border-l-4 border-stone-200 dark:border-stone-800 pl-8">
                          "{expandedEntry.note}"
                        </div>
                      )}

                      <div className="flex flex-wrap gap-3 mb-12">
                        {expandedEntry.tags?.map(tag => (
                          <span key={tag} className="text-base bg-stone-100 dark:bg-stone-800/50 text-stone-500 dark:text-stone-400 px-5 py-2 rounded-full border border-stone-200 dark:border-stone-700">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-8">
                      <div className="flex flex-col sm:flex-row gap-4">
                        {expandedEntry.plurkUrl && (
                          <a 
                            href={expandedEntry.plurkUrl} target="_blank" rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-3 py-5 bg-stone-800 dark:bg-stone-700 hover:bg-stone-900 dark:hover:bg-stone-600 text-white rounded-2xl font-bold transition-all shadow-xl active:scale-95 text-lg"
                          >
                            <PlurkPIcon size={20} />
                            <span>前往噗文</span>
                          </a>
                        )}
                        <button 
                          onClick={() => setExpandedEntry(null)}
                          className="px-10 py-5 border-2 border-stone-200 dark:border-stone-800 rounded-2xl hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors text-stone-600 dark:text-stone-400 font-bold text-lg"
                        >
                          返回列表
                        </button>
                      </div>

                      {/* Admin Tools Section */}
                      <div className="flex flex-wrap items-center justify-between gap-4 pt-8 border-t border-stone-200 dark:border-stone-800">
                        <span className="text-[10px] text-stone-400 font-bold uppercase tracking-[0.3em]">管理者工具</span>
                        <div className="flex gap-3">
                          <button 
                            onClick={() => handleEdit(expandedEntry)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 rounded-xl text-sm font-bold transition-all"
                          >
                            <Edit2 size={16} /> 編輯
                          </button>
                          <button 
                            onClick={() => handleDelete(expandedEntry.id)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-500 rounded-xl text-sm font-bold transition-all"
                          >
                            <Trash2 size={16} /> 刪除
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Stats */}
            <footer className="mt-20 pb-12">
              <div className="bg-[#8b5e3c] dark:bg-stone-800 rounded-xl p-8 md:p-12 text-center text-[#fbf7f3] dark:text-stone-300 relative overflow-hidden shadow-lg transition-all duration-500">
                <div className="relative z-10 flex flex-col items-center">
                  <h3 className="text-3xl font-serif font-medium mb-4 text-white tracking-wide">撒下的百合花</h3>
                  <p className="text-sm opacity-90 leading-7 max-w-lg mx-auto mb-10 text-stone-100">
                    儘量記錄看過的作品，留存當下的情緒
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl">
                     {[
                       { v: stats.total, l: '總收藏' },
                       { v: stats.manga, l: '漫畫' },
                       { v: stats.novel, l: '小說' },
                       { v: stats.movie, l: '電影' }
                     ].map(s => (
                       <div key={s.l} className="bg-white/10 dark:bg-stone-900/20 rounded-lg p-4 backdrop-blur-sm flex flex-col items-center justify-center h-24 border border-white/10 hover:bg-white/20 transition-colors group/stat">
                          <span className="text-3xl font-bold text-white mb-1 group-hover/stat:scale-110 transition-transform">{s.v}</span>
                          <span className="text-xs text-stone-100 tracking-wider font-medium opacity-80">
                            {s.l}
                          </span>
                       </div>
                     ))}
                  </div>
                </div>
                <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-80 h-80 bg-black/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
              </div>
            </footer>
          </div>
        </main>
      </div>

      <AddEntryModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        onRefresh={fetchEntries} 
        entry={editingEntry}
      />
    </div>
  );
};

export default App;
