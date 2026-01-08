import React from 'react';
import { 
  X, 
  LayoutGrid, 
  Book, 
  BookType, 
  Film, 
  Tv, 
  Gamepad2, 
  Clapperboard,
  Sparkles 
} from 'lucide-react';
// 1. 必須引入 Category，這樣點擊時傳回去的字串才不會出錯
import { Category } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void; // 改為 onClose，對齊 App.tsx
  selectedCategory: string;
  onSelectCategory: (category: string) => void; // 改為 onSelectCategory
  libraryType: 'lily' | 'gay';
  onTypeToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  selectedCategory,
  onSelectCategory,
  libraryType,
  onTypeToggle
}) => {
  // 2. 將 name 對齊 Category Enum 的值
  const categories = [
    { name: '全部收藏', value: 'ALL', icon: LayoutGrid },
    { name: '漫畫', value: Category.MANGA, icon: Book },
    { name: '小說', value: Category.NOVEL, icon: BookType },
    { name: '電影', value: Category.MOVIE, icon: Film },
    { name: '動畫', value: Category.ANIMATION, icon: Tv },
    { name: '遊戲', value: Category.GAME, icon: Gamepad2 },
    { name: '劇集', value: Category.DRAMA_SERIES, icon: Clapperboard },
  ];

  return (
    <>
      {/* 手機版遮罩 */}
      <div 
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* 側邊欄主體 */}
      <aside className={`
        fixed top-0 left-0 h-full w-72 bg-[#F2EEE9] flex flex-col transition-transform duration-300 z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0
      `}>
        
        {/* 1. 頂部標題 */}
        <div className="p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-[#5C5248]">分類導覽</h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-[#EAE4DD] rounded-full transition-colors lg:hidden"
          >
            <X size={28} className="text-[#8C7B6D]" />
          </button>
        </div>

        {/* 2. 副標題區 */}
        <div className="px-6 mb-6 text-left">
          <p className="text-[#8C7B6D] font-medium opacity-80">圖書登記清單</p>
          <p className="text-[#8C7B6D] text-sm opacity-60">
            {libraryType === 'lily' ? '百合花開的世界' : '甲片珍藏館'}
          </p>
        </div>

        {/* 3. 分類選單 */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {categories.map((cat) => {
            const Icon = cat.icon;
            // 判斷是否選中
            const isActive = selectedCategory === cat.value;
            
            return (
              <button
                key={cat.value}
                onClick={() => {
                  onSelectCategory(cat.value);
                  if (window.innerWidth < 1024) onClose();
                }}
                className={`
                  w-full flex items-center gap-4 px-5 py-4 rounded-[18px] transition-all duration-200
                  ${isActive 
                    ? 'bg-[#8C7B6D] text-white shadow-lg shadow-[#8C7B6D]/20 translate-x-1' 
                    : 'text-[#8C7B6D] hover:bg-
