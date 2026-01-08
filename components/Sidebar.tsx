import React from 'react';
import { X, LayoutGrid, BookOpen, Book, Film, Tv, Gamepad2, Clapperboard, Sparkles } from 'lucide-react';
import { Category } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
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
      {/* 背景遮罩 */}
      <div 
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-[100] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose} 
      />

      {/* 側邊欄主體 */}
      <aside className={`fixed inset-y-0 left-0 w-[280px] bg-[#F2EEE9] z-[110] transition-transform duration-500 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl`}>
        <div className="p-8 flex flex-col h-full text-left">
          
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[#5E5045] font-serif">分類導覽</h2>
            <button onClick={onClose} className="p-1 lg:hidden text-[#5E5045]"><X size={26} /></button>
          </div>

          <div className="mb-10 text-[13px] text-[#A8A29E] font-medium tracking-tight">
            <p>圖書登記清單</p>
            <p>百合花開的世界</p>
          </div>

          <nav className="flex-1 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isSelected = selectedCategory === item.id;
              return (
                <button 
                  key={item.id} 
                  onClick={() => { onSelectCategory(item.id); onClose(); }}
                  className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-300 ${
                    isSelected ? 'bg-[#8C7B6D] text-white shadow-lg' : 'text-[#5E5045] hover:bg-white/40'
                  }`}
                >
                  <Icon size={20} /> 
                  <span className="font-medium tracking-wide">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* 底部按鈕修正：點擊會跳轉至「甲片」分類 */}
          <div className="pt-6 border-t border-[#DED8D1]">
            <button 
              onClick={() => { onSelectCategory(Category.GAY); onClose(); }}
              className={`w-full flex items-center justify-center gap-2.5 p-4 rounded-full transition-all duration-300 border ${
                selectedCategory === Category.GAY 
                ? 'bg-[#5E5045] text-white border-transparent shadow-inner' 
                : 'bg-[#EAE4DD] border-[#DED8D1] text-[#8C7B6D] hover:bg-[#DED8D1]'
              }`}
            >
              <Sparkles size={18} />
              <span className="font-bold tracking-tight text-[15px]">甲片 ver.</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
