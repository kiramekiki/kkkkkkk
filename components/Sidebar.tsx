import React from 'react';
import { X, LayoutGrid, BookOpen, Book, Film, Tv, Gamepad2, Clapperboard, Sparkles } from 'lucide-react';
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
      {/* 遮罩層 (點擊背景關閉) */}
      <div 
        className={`fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[100] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose} 
      />

      {/* 側邊欄主體 */}
      <aside className={`fixed inset-y-0 left-0 w-[280px] bg-[#F8F5F2] border-r border-[#EADDD5] z-[110] transition-transform duration-500 ease-in-out transform 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl shadow-black/5`}>
        
        <div className="p-8 flex flex-col h-full">
          
          {/* 標題區域 */}
          <div className="flex justify-between items-start mb-10">
            <div>
              <h2 className="text-[22px] font-bold text-[#5E5045] font-serif tracking-tight">分類導覽</h2>
              <div className="mt-2 text-[11px] text-[#A8A29E] leading-relaxed">
                <p>圖書登記清單</p>
                <p>百合花開的世界</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 text-[#A8A29E] hover:text-[#5E5045] transition-colors">
              <X size={24} strokeWidth={1.5} />
            </button>
          </div>

          {/* 導覽按鈕清單 */}
          <nav className="flex-1 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isSelected = selectedCategory === item.id;
              return (
                <button 
                  key={item.id} 
                  onClick={() => { onSelectCategory(item.id as any); onClose(); }}
                  className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-[18px] transition-all duration-300 group
                    ${isSelected 
                      ? 'bg-[#8C7B6D] text-white shadow-lg shadow-[#8C7B6D]/30' 
                      : 'text-[#5E5045] hover:bg-[#F0ECE6]/60'
                    }`}
                >
                  <Icon 
                    size={20} 
                    strokeWidth={isSelected ? 2 : 1.5}
                    className={isSelected ? 'text-white' : 'text-[#5E5045] opacity-70'} 
                  /> 
                  <span className={`text-[15px] ${isSelected ? 'font-medium' : 'font-normal'}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* 分隔線與底部按鈕 */}
          <div className="pt-6 border-t border-[#EADDD5]">
            <button 
              onClick={() => { onSelectCategory(Category.GAY); onClose(); }}
              className={`w-full flex items-center justify-center gap-2.5 p-4 rounded-[20px] border transition-all duration-300
              ${selectedCategory === Category.GAY 
                ? 'bg-[#5E5045] text-white border-transparent shadow-md' 
                : 'bg-[#F0ECE6] border-[#E6E0D9] text-[#8C7B6D] hover:bg-[#EADDD5]'
              }`}
            >
              <Sparkles 
                size={18} 
                className={selectedCategory === Category.GAY ? 'text-white' : 'text-[#8C7B6D] opacity-70'} 
                strokeWidth={2}
              />
              <span className="text-[14px] font-bold tracking-wide">甲片 ver.</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
