import React from 'react';
import { X, LayoutGrid, BookOpen, Book, Film, Tv, MoreHorizontal, Heart } from 'lucide-react';
import { Category } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategory: Category | 'ALL';
  onSelectCategory: (category: Category | 'ALL') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, selectedCategory, onSelectCategory }) => {
  const menuItems = [
    { id: 'ALL', label: '全部', icon: LayoutGrid },
    { id: Category.MANGA, label: '漫畫', icon: BookOpen },
    { id: Category.NOVEL, label: '小說', icon: Book },
    { id: Category.MOVIE, label: '電影', icon: Film },
    { id: Category.ANIMATION, label: '動畫', icon: Tv },
    { id: Category.GAME, label: '遊戲', icon: Gamepad2 },
    { id: Category.DRAMA_SERIES, label: '劇集', icon: Clapperboard },
  ];

  return (
    <>
      {/* 遮罩層 */}
      <div 
        className={`fixed inset-0 bg-black/20 backdrop-blur-[1px] z-[100] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose} 
      />

      {/* 側邊欄主體：背景改為更精準的暖灰色 */}
      <aside className={`fixed inset-y-0 left-0 w-[280px] bg-[#F2EEE9] border-r border-[#E2DDD9] z-[110] transition-transform duration-500 ease-in-out transform 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl shadow-black/5`}>
        
        <div className="p-8 flex flex-col h-full">
          
          {/* 標題與關閉按鈕 */}
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-[24px] font-bold text-[#5E5045] tracking-tight">分類導覽</h2>
            <button onClick={onClose} className="p-1 text-[#5E5045] opacity-60 hover:opacity-100 transition-opacity">
              <X size={26} strokeWidth={1.2} />
            </button>
          </div>

          {/* 副標題：緊貼標題，顏色微調 */}
          <div className="mb-10 text-[13px] text-[#A8A29E] font-medium leading-relaxed">
            <p>圖書登記清單</p>
            <p>百合花開的世界</p>
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
                  className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-300
                    ${isSelected 
                      ? 'bg-[#8C7B6D] text-white shadow-lg shadow-black/10' 
                      : 'text-[#5E5045] hover:bg-white/40'
                    }`}
                >
                  <Icon 
                    size={22} 
                    strokeWidth={isSelected ? 2 : 1.2}
                    className={isSelected ? 'text-white' : 'text-[#5E5045]'} 
                  /> 
                  <span className={`text-[16px] tracking-wide ${isSelected ? 'font-bold' : 'font-medium'}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* 底部按鈕：對應右圖的淺色橢圓風格 */}
          <div className="pt-6 border-t border-[#E2DDD9]">
            <button 
              onClick={() => { onSelectCategory(Category.GAY); onClose(); }}
              className={`w-full flex items-center justify-center gap-2 p-4 rounded-[20px] border transition-all duration-300
              ${selectedCategory === Category.GAY 
                ? 'bg-[#5E5045] text-white border-transparent' 
                : 'bg-[#EAE4DD] border-[#DED8D1] text-[#8C7B6D] hover:bg-[#E2DDD9]'
              }`}
            >
              <Heart 
                size={18} 
                className={selectedCategory === Category.GAY ? 'fill-white' : 'text-[#8C7B6D]'} 
                strokeWidth={2}
              />
              <span className="text-[15px] font-bold tracking-wider">甲片 ver.</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
