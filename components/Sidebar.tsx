import React from 'react';
import { Category } from '../types';
import { BookOpen, Film, Tv, Book, Gamepad2, LayoutGrid, X, Clapperboard, Sparkles } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategory: Category | 'ALL';
  onSelectCategory: (cat: Category | 'ALL') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, selectedCategory, onSelectCategory }) => {
  const categories = [
    { id: 'ALL', label: '全部收藏', icon: LayoutGrid },
    { id: Category.MANGA, label: Category.MANGA, icon: BookOpen },
    { id: Category.NOVEL, label: Category.NOVEL, icon: Book },
    { id: Category.MOVIE, label: Category.MOVIE, icon: Film },
    { id: Category.ANIMATION, label: Category.ANIMATION, icon: Tv },
    { id: Category.GAME, label: Category.GAME, icon: Gamepad2 },
    { id: Category.DRAMA_SERIES, label: Category.DRAMA_SERIES, icon: Clapperboard },
  ];

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar Content */}
      <aside 
        className={`
          fixed top-0 left-0 h-full w-64 bg-earth-100 dark:bg-stone-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-r border-earth-200 dark:border-stone-700
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="p-6 flex justify-between items-center">
          <span className="text-xl font-bold text-earth-800 dark:text-earth-100">分類導覽</span>
          <button onClick={onClose} className="text-earth-600 dark:text-earth-300 hover:text-earth-800 dark:hover:text-earth-100 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="mt-4 px-4">
          <div className="mb-8 px-4">
             <h2 className="text-sm font-bold uppercase tracking-wider text-earth-500 dark:text-earth-400">
               圖書登記清單
             </h2>
             <p className="text-xs text-earth-400 mt-1">百合花開的世界</p>
          </div>

          <nav className="space-y-2">
            {categories.map((item) => {
              const Icon = item.icon;
              const isSelected = selectedCategory === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectCategory(item.id as Category | 'ALL');
                    onClose();
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                    ${isSelected 
                      ? 'bg-earth-500 text-white shadow-md' 
                      : 'text-earth-700 dark:text-stone-300 hover:bg-earth-200 dark:hover:bg-stone-700'
                    }
                  `}
                >
                  <span className="w-5 flex justify-center"><Icon size={18} /></span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
        
        <div className="absolute bottom-8 left-0 w-full px-6">
          <button 
            onClick={() => {
                onSelectCategory(Category.GAY);
                onClose();
            }}
            className="w-full py-3 bg-[#ebe3d5] dark:bg-stone-700 hover:bg-[#e2d8c9] dark:hover:bg-stone-600 text-[#8c7b6d] dark:text-earth-200 rounded-xl text-sm font-bold shadow-soft transition-all active:scale-95 flex items-center justify-center gap-2 border border-[#d4c5a8]/30 dark:border-stone-600"
          >
            <Sparkles size={16} className="text-[#a89988]" />
            <span>甲片 ver.</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
