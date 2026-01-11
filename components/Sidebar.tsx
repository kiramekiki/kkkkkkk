import React from 'react';
import { X, LayoutGrid, BookOpen, Book, Film, Tv, Gamepad2, Clapperboard, Info } from 'lucide-react';
import { Category } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategory: string;
  onSelectCategory: (cat: any) => void;
}

// 核心組件：中文字體優化版的圓弧文字郵票按鈕
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
    className="group relative flex flex-col items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95"
  >
    {/* 容器 w-32 h-32 */}
    <div className="relative w-32 h-32 flex items-center justify-center">
      <img 
        src={imgSrc} 
        className="w-[82%] h-[82%] object-contain drop-shadow-md opacity-95 group-hover:opacity-100 transition-opacity" 
        alt="support icon" 
      />
      
      {/* SVG 圓弧文字層：中文字體稍微放大一點到 9px */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
        <defs>
          <path id="pathTop" d="M 18,50 A 32,32 0 0,1 82,50" fill="transparent" />
          <path id="pathBottom" d="M 18,50 A 32,32 0 0,0 82,50" fill="transparent" />
        </defs>
        
        {/* 上半部中文字 */}
        <text className="fill-[#A8A29E] dark:fill-stone-400 text-[9px] font-bold tracking-[0.1em]">
          <textPath href="#pathTop" startOffset="50%" textAnchor="middle">
            {topText}
          </textPath>
        </text>
        
        {/* 下半部中文字 */}
        <text className="fill-[#A8A29E] dark:fill-stone-400 text-[9px] font-bold tracking-[0.1em]">
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

          <div className="mb-8 text-[13px] text-[#A8A29E] font-medium tracking-tight text-left">
            <p>圖書登記清單</p>
            <p>百合花開的世界</p>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto hide-scrollbar">
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

          {/* 贊助區域：依照要求標註左右與更換文字 --- */}
          <div className="mt-auto pt-6 border-t border-stone-300/30">
            <h3 className="text-sm font-bold text-[#5E5045] dark:text-stone-300 text-center mb-6 tracking-widest">
              請我喝一杯手搖 🧋
            </h3>
            
            <div className="flex justify-center gap-2">
              {/* 左側：TWQR - 澆花器 */}
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-bold text-[#A8A29E] mb-1">TWQR</span>
                <SupportStamp 
                  imgSrc="/support-garden.png" 
                  topText="四捨" 
                  bottomText="五入" 
                  link="https://qr.opay.tw/8yfYV"
                />
              </div>

              {/* 右側：普通 - 手搖飲 */}
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-bold text-[#A8A29E] mb-1">普通</span>
                <SupportStamp 
                  imgSrc="/support-tea.png" 
                  topText="算是一種" 
                  bottomText="推金幣" 
                  link="https://qr.opay.tw/jjWD2"
                />
              </div>
            </div>
            
            <div className="text-center mt-4">
              <p className="text-[10px] text-[#A8A29E] opacity-50 font-serif italic">Lily Library © 2026</p>
            </div>
          </div>
          
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
