import React from 'react';
import { X, LayoutGrid, BookOpen, Book, Film, Tv, Gamepad2, Clapperboard, Info } from 'lucide-react';
import { Category } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategory: string;
  onSelectCategory: (cat: any) => void;
}

// 核心組件：純淨版郵票按鈕 (無任何邊框或線條)
const SupportStamp = ({ 
  imgSrc, 
  link 
}: { 
  imgSrc: string; 
  link: string 
}) => (
  <a 
    href={link} 
    target="_blank" 
    rel="noopener noreferrer" 
    className="group relative flex flex-col items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
  >
    <div className="relative w-24 h-24 flex items-center justify-center">
      <img 
        src={imgSrc} 
        className="w-full h-full object-contain drop-shadow-md opacity-90 group-hover:opacity-100 transition-opacity" 
        alt="support icon" 
      />
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
            <button onClick={onClose} className="p-1 hover:bg-white/50 rounded-full transition-colors text-stone-400"><X size={24} /></button>
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

          {/* --- 贊助區域：極簡精緻版 --- */}
          <div className="mt-auto pt-6 border-t border-stone-300/30 text-center">
            <div className="mb-6">
              {/* 標題：縮小至 text-base (16px)，增加字距 tracking-widest */}
              <h3 className="text-base font-serif font-bold text-[#5E5045] dark:text-stone-100 tracking-widest">
                請我喝一杯手搖🧋
              </h3>
              {/* 副標題：保持 11px，呈現精緻註解感 */}
              <p className="text-[11px] text-[#A8A29E] font-medium mt-1 tracking-wider opacity-80">
                四捨五入算是一種推金幣
              </p>
            </div>
            
            <div className="flex justify-center gap-4 mb-6">
              {/* 左側：TWQR */}
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-bold text-[#A8A29E] uppercase tracking-widest mb-2">TWQR</span>
                <SupportStamp 
                  imgSrc="/support-garden.png" 
                  link="https://qr.opay.tw/8yfYV"
                />
              </div>

              {/* 右側：普通 */}
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-bold text-[#A8A29E] uppercase tracking-widest mb-2">贊助</span>
                <SupportStamp 
                  imgSrc="/support-tea.png" 
                  link="https://qr.opay.tw/jjWD2"
                />
              </div>
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
