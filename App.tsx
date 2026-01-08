import React from 'react';
import { 
  X, LayoutGrid, BookOpen, Book, Film, Tv, 
  Gamepad2, Clapperboard, Sparkles 
} from 'lucide-react';
import { Category } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategory: Category | 'ALL';
  onSelectCategory: (category: Category | 'ALL') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, selectedCategory, onSelectCategory }) => {
  // 分類導覽清單
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
        className={`fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[100] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0
