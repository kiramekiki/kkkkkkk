import React from 'react';
import { X, LayoutGrid, BookOpen, Book, Film, Tv, Gamepad2, Clapperboard, Heart, Sparkles } from 'lucide-react';
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
      {/* 遮罩層：當側邊欄打開時，背景變暗（點擊背景可收起） */}
      <div 
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-[100] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose} 
      />

      {/* 側邊欄：不再有 lg:translate-x-0，完全由 isOpen 控制 */}
      <aside className={`fixed inset-y-0 left-0 w-72 bg-[#fdfcfb] border-r border-[#eaddc5] z-[110] transition-transform duration-500 ease-in-out transform 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl`}>
        
        <div className="p-8 flex flex-col h-full">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-xl font-bold text-[#5e5045] font-serif">分類導覽</h2>
              <p className="text-[10px] text-stone-400 uppercase tracking-widest mt-1">LILY GARDEN LIBRARY</p>
            </div>
            {/* 側邊欄內的關閉按鈕 */}
            <button onClick={onClose} className="p-2 text-stone-400 hover:text-[#8c7b6d] transition-colors">
              <X size={24}/>
            </button>
          </div>

          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isSelected = selectedCategory === item.id;
              return (
                <button 
                  key={item.id} 
                  onClick={() => { onSelectCategory(item.id as any); onClose(); }}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${isSelected ? 'bg-[#8c7b6d] text-white shadow-lg' : 'text-[#8c7b6d] hover:bg-[#f0ece6]'}`}
                >
                  <Icon size={20} /> <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* 底部甲片按鈕 */}
          <div className="pt-6 border-t border-[#eaddc5]">
            <button 
              onClick={() => { onSelectCategory(Category.GAY); onClose(); }}
              className={`w-full flex items-center justify-center gap-3 p-5 rounded-2xl border transition-all 
              ${selectedCategory === Category.GAY ? 'bg-[#2e2a1c] text-white shadow-inner' : 'bg-[#f0ece6] border-[#eaddc5] text-[#8c7b6d] hover:bg-[#eaddc5]'}`}
            >
              <Sparkles size={18} className={selectedCategory === Category.GAY ? 'fill-yellow-400' : 'text-yellow-600'} />
              <span className="font-bold">✨ 甲片 ver.</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
