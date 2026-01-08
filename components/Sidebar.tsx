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
  // 按照截圖清單排列
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
      {/* 遮罩層 */}
      <div 
        className={`fixed inset-0 bg-black/10 backdrop-blur-[1px] z-[100] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose} 
      />

      {/* 側邊欄主體 */}
      <aside className={`fixed inset-y-0 left-0 w-[280px] bg-[#F2EEE9] border-r border-[#E2DDD9] z-[110] transition-transform duration-500 ease-in-out transform 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl shadow-black/5`}>
        
        <div className="p-8 flex flex-col h-full">
          
          {/* 標題與關閉按鈕 */}
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-[26px] font-bold text-[#5E5045] tracking-tight font-serif">分類導覽</h2>
            <button onClick={onClose} className="p-1 text-[#5E5045] opacity-50 hover:opacity-100 transition-opacity">
              <X size={28} strokeWidth={1.2} />
            </button>
          </div>

          {/* 副標題：灰色、小字、兩行緊貼 */}
          <div className="mb-10 text-[13px] text-[#A8A29E] font-medium leading-[1.4]">
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
                  className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-[20px] transition-all duration-300
                    ${isSelected 
                      ? 'bg-[#8C7B6D] text-white shadow-lg shadow-black/5' 
                      : 'text-[#5E5045] hover:bg-white/40'
                    }`}
                >
                  <Icon 
                    size={22} 
                    strokeWidth={isSelected ? 2 : 1.2}
                    className={isSelected ? 'text-white' : 'text-[#5E5045]'} 
                  /> 
                  <span className={`text-[16px] tracking-wide ${isSelected ? 'font-bold' : 'font-medium opacity-90'}`}>
                    {item.label}
                  </s
