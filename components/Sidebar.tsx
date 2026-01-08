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

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  libraryType: 'lily' | 'gay';
  onTypeToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  setIsOpen,
  selectedCategory,
  setSelectedCategory,
  libraryType,
  onTypeToggle
}) => {
  // 分類清單與對應的圖示
  const categories = [
    { name: '全部收藏', icon: LayoutGrid },
    { name: '漫畫', icon: Book },
    { name: '小說', icon: BookType },
    { name: '電影', icon: Film },
    { name: '動畫', icon: Tv },
    { name: '遊戲', icon: Gamepad2 },
    { name: '劇集', icon: Clapperboard },
  ];

  return (
    <>
      {/* 手機版遮罩 */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 側邊欄主體 */}
      <aside className={`
        fixed top-0 left-0 h-full w-72 bg-[#F2EEE9] flex flex-col transition-transform duration-300 z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0
      `}>
        
        {/* 1. 頂部標題區 */}
        <div className="p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-[#5C5248]">分類導覽</h2>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-[#EAE4DD] rounded-full transition-colors lg:hidden"
          >
            <X size={28} className="text-[#8C7B6D]" />
          </button>
        </div>

        {/* 2. 副標題區 */}
        <div className="px-6 mb-6">
          <p className="text-[#8C7B6D] font-medium opacity-80">圖書登記清單</p>
          <p className="text-[#8C7B6D] text-sm opacity-60">百合花開的世界</p>
        </div>

        {/* 3. 分類選單 */}
        <nav className="flex-1 px-4 space-y-1">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.name;
            
            return (
              <button
                key={cat.name}
                onClick={() => {
                  setSelectedCategory(cat.name);
                  if (window.innerWidth < 1024) setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-4 px-5 py-4 rounded-[18px] transition-all duration-200
                  ${isActive 
                    ? 'bg-[#8C7B6D] text-white shadow-lg shadow-[#8C7B6D]/20 translate-x-1' 
                    : 'text-[#8C7B6D] hover:bg-[#EAE4DD] hover:translate-x-1'}
                `}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-lg ${isActive ? 'font-bold' : 'font-medium'}`}>
                  {cat.name}
                </span>
              </button>
            );
          })}
        </nav>

        {/* 4. 底部切換按鈕 (橢圓形設計) */}
        <div className="p-6">
          <button
            onClick={onTypeToggle}
            className="w-full py-4 bg-[#EAE4DD] border border-[#DCD3C9] rounded-[20px] flex items-center justify-center gap-2 text-[#8C7B6D] hover:bg-[#DCD3C9] transition-all active:scale-95 shadow-sm"
          >
            <Sparkles size={18} />
            <span className="font-bold tracking-wide">
              {libraryType === 'lily' ? '甲片 ver.' : '百合 ver.'}
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
