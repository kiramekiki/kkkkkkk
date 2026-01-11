import React from 'react';
import { X, LayoutGrid, BookOpen, Book, Film, Tv, Gamepad2, Clapperboard, Info } from 'lucide-react';
import { Category } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategory: string;
  onSelectCategory: (cat: any) => void;
}

// ★★★ 核心組件：圓弧文字郵票按鈕
const SupportStamp = ({ 
  imgSrc, 
  topText, 
  bottomText, 
  link 
}: { 
  imgSrc: string; 
  topText: string; 
  bottomText: string; 
  link: string 
}) => (
  <a 
    href={link} 
    target="_blank" 
    rel="noopener noreferrer" 
    className="group relative flex flex-col items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
  >
    <div className="relative w-20 h-20 flex items-center justify-center">
      {/* 郵票圖片 */}
      <img 
        src={imgSrc} 
        className="w-[75%] h-[75%] object-contain drop-shadow-sm opacity-90 group-hover:opacity-100 transition-opacity" 
        alt="support icon" 
      />
      
      {/* SVG 圓弧文字 */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
        <defs>
          {/* 上半部路徑 */}
          <path id="pathTop" d="M 20,50 A 30,30 0 0,1 80,50" fill="transparent" />
          {/* 下半部路徑 */}
          <path id="pathBottom" d="M 20,50 A 30,30 0 0,0 80,50" fill="transparent" />
        </defs>
        
        {/* 上半部文字 */}
        <text className="fill-[#A8A29E] dark:fill-stone-400 text-[7px] font-bold tracking-[0.15em] uppercase">
          <textPath href="#pathTop" startOffset="50%" textAnchor="middle">
            {topText}
          </textPath>
        </text>
        
        {/* 下半部文字 */}
        <text className="fill-[#A8A29E] dark:fill-stone-400 text-[7px] font-bold tracking-[0.15em] uppercase">
          <textPath href="#pathBottom" startOffset="50%" textAnchor="middle">
            {bottomText}
          </textPath>
        </text>
      </svg>
    </div>
  </a>
);

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, selectedCategory, onSelectCategory }) => {
  const menuItems = [
    { id: 'ALL', label: '全部收藏', icon: LayoutGrid },
    { id: Category.MANGA, label: '漫畫', icon: BookOpen },
    { id: Category.NOVEL, label: '小說', icon: Book },
    { id: Category.MOVIE, label: '電影', icon: Film },
    { id: Category.ANIMATION, label: '動畫', icon: Tv },
    { id: Category.GAME, label: '遊戲', icon: Gamepad2 },
    { id: Category.DRAMA_SERIES, label: '劇集', icon: Clapperboard },
    { id: Category.OTHER, label: '其他', icon: Info },
  ];

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-[100] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose} 
      />

      <aside className={`fixed inset-y-0 left-0 w-[280px] bg-[#F2EEE9] dark:bg-[#1c1c1a] z-[110] shadow-2xl transition-transform duration-500 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 flex flex-col h-full text-[#5E5045] dark:text-stone-300">
          
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl font-serif font-bold tracking-tight">分類導覽</h2>
            <button onClick={onClose} className="p-1 hover:bg-white/50 rounded-full transition-colors"><X size={24} /></button>
          </div>

          <div className="mb-10 text-[13px] text-[#A8A29E] font-medium tracking-tight text-left">
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
                  className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 ${
                    isSelected ? 'bg-[#8C7B6D] text-white shadow-lg' : 'hover:bg-white/40 dark:hover:bg-stone-800'
                  }`}
                >
                  <Icon size={20} /> 
                  <span className="font-medium tracking-wide">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* ★★★ 新增：支持圖書館區塊 */}
          <div className="mt-auto pt-6 border-t border-stone-300/30">
            <p className="text-[9px] font-bold text-[#A8A29E] uppercase tracking-[0.2em] mb-4 text-center">
              Support the Library
            </p>
            <div className="flex justify-center gap-4 mb-6">
              {/* 澆花器按鈕 */}
              <SupportStamp 
                imgSrc="/support-garden.png" 
                topText="GARDEN CARE" 
                bottomText="KEEP IT GROWING" 
                link="https://qr.opay.tw/8yfYV"
              />
              {/* 手搖飲按鈕 */}
              <SupportStamp 
                imgSrc="/support-tea.png" 
                topText="SUGAR BOOST" 
                bottomText="BUY ME A DRINK" 
                link="https://qr.opay.tw/jjWD2"
              />
            </div>
            
            <div className="text-center">
              <p className="text-[10px] text-[#A8A29E] opacity-50 font-serif italic">Lily Library © 2026</p>
            </div>
          </div>
          
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
