import React from 'react';
import { X, LayoutGrid, BookOpen, Book, Film, Tv, Gamepad2, Clapperboard, Sparkles } from 'lucide-react';
import { Category } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategory: string;
  onSelectCategory: (cat: any) => void;
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
      <div className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-[100] transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
      <aside className={`fixed inset-y-0 left-0 w-[280px] bg-[#F2EEE9] z-[110] transition-transform duration-500 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:static lg:translate-x-0`}>
        <div className="p-8 flex flex-col h-full text-[#5E5045]">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl font-serif font-bold tracking-tight">分類導覽</h2>
            <button onClick={onClose} className="lg:hidden"><X /></button>
          </div>
          <nav className="flex-1 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isSelected = selectedCategory === item.id;
              return (
                <button 
                  key={item.id} onClick={() => { onSelectCategory(item.id); onClose(); }}
                  className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all ${isSelected ? 'bg-[#8C7B6D] text-white shadow-lg' : 'hover:bg-white/40'}`}
                >
                  <Icon size={20} /> <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
          <div className="pt-6 border-t border-[#DED8D1]">
            <button 
              onClick={() => { onSelectCategory(Category.GAY); onClose(); }}
              className={`w-full flex items-center justify-center gap-2.5 p-4 rounded-full transition-all border ${
                selectedCategory === Category.GAY 
                ? 'bg-[#5E5045] text-white border-transparent shadow-inner' 
                : 'bg-[#EAE4DD] border-[#DED8D1] text-[#8C7B6D] hover:bg-[#DED8D1]'
              }`}
            >
              <Sparkles size={18} />
              <span className="font-bold text-[15px]">甲片 ver.</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
export default Sidebar;
