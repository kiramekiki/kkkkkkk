export enum Category {
  MANGA = '漫畫',
  NOVEL = '小說',
  MOVIE = '電影',
  ANIMATION = '動畫',
  GAME = '遊戲',
  DRAMA_SERIES = '劇集',
  GAY = '甲片'
  OTHER = '其他'
}

export enum Rating {
  BIBLE = '聖經',
  TOP_TIER = '極品',
  DESTINY = '頂級',
  ORDINARY = '普通',
  MYSTERIOUS = '神秘'
}

export interface Entry {
  id: string;
  title: string;
  author: string;
  category: Category;
  rating: Rating;
  coverUrl?: string;
  note?: string;
  tags: string[];
  plurkUrl?: string;
  createdAt: number;
}

export const RATING_STYLES: Record<Rating, string> = {
  [Rating.BIBLE]: 'bg-amber-50 text-amber-700 border-amber-200',
  [Rating.TOP_TIER]: 'bg-rose-50 text-rose-700 border-rose-200',
  [Rating.DESTINY]: 'bg-blue-50 text-blue-700 border-blue-200',
  [Rating.ORDINARY]: 'bg-stone-50 text-stone-700 border-stone-200',
  [Rating.MYSTERIOUS]: 'bg-purple-50 text-purple-700 border-purple-200',
};

export const RATING_WEIGHTS: Record<Rating, number> = {
  [Rating.BIBLE]: 5, [Rating.TOP_TIER]: 4, [Rating.DESTINY]: 3, [Rating.ORDINARY]: 2, [Rating.MYSTERIOUS]: 1,
};

export const CATEGORY_STYLES: Record<string, string> = {
  [Category.MANGA]: 'text-blue-500 border-blue-200',
  [Category.NOVEL]: 'text-emerald-500 border-emerald-200',
  DEFAULT: 'text-stone-400 border-stone-200'
};

// types.ts 中的對照表
export const CATEGORY_DISPLAY_MAP: Record<string, string> = {
  [Category.MANGA]: 'MANGA',
  [Category.NOVEL]: 'NOVEL',
  [Category.MOVIE]: 'MOVIE',
  [Category.ANIMATION]: 'ANIME',
  [Category.GAME]: 'GAME',
  [Category.DRAMA_SERIES]: 'DRAMA',
  [Category.GAY]: 'GAY'
   [Category. OTHER]:'OTHER'
};
