import React from 'react';
import { X, LayoutGrid, BookOpen, Book, Film, Tv, Gamepad2, Clapperboard, Heart } from 'lucide-react';
import { Category } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategory: Category | 'ALL';
  onSelectCategory: (category: Category | 'ALL') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, selectedCategory, onSelectCategory }) => {
  const menuItems = [
    { id: 'ALL', label: '全部收藏', icon: LayoutGrid },
    { id: Category.MANGA, label: '漫畫', icon: BookOpen },
    { id: Category.NOVEL, label: '小說', icon: Book },
    { id: Category.MOVIE, label: '電影', icon: Film },
    { id: Category.ANIMATION, label: '動畫', icon: Tv },
    { id: Category.GAME, label: '遊戲', icon: Gamepad2 },
    { id: Category.DRAMA_SERIES, label: '劇集', icon: Clapperboard },
  ];

  return (
    <>
      <div className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
      <aside className={`fixed inset-y-0 left-0 w-64 bg-[#fdfcfb] dark:bg-[#1c1c1a] border-r border-stone-200 dark:border-stone-800 z-50 transition-transform lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-xl font-serif font-bold text-stone-800 dark:text-stone-100">分類導覽</h2>
              <p className="text-[10px] text-stone-400 uppercase tracking-widest mt-1">圖書登記清單 / 百合花開的世界</p>
            </div>
            <button onClick={onClose} className="lg:hidden p-2 text-stone-400 hover:text-stone-800"><X size={20}/></button>
          </div>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isSelected = selectedCategory === item.id;
              return (
                <button key={item.id} onClick={() => { onSelectCategory(item.id as any); onClose(); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isSelected ? 'bg-[#8c7b6d] text-white shadow-md font-medium' : 'text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800'}`}>
                  <Icon size={18} /> <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
          <div className="absolute bottom-8 left-6 right-6">
            <button onClick={() => { onSelectCategory(Category.GAY); onClose(); }}
              className={`w-full flex items-center justify-center gap-2 p-4 rounded-2xl border transition-all ${selectedCategory === Category.GAY ? 'bg-stone-800 text-white' : 'bg-stone-100 dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400'}`}>
              <Heart size={16} className={selectedCategory === Category.GAY ? 'fill-white' : ''} />
              <span className="text-sm font-bold">✨ 甲片 ver.</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
