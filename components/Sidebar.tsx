  <button
                  key={item.id}
                  onClick={() => {
                    onSelectCategory(item.id as Category | 'ALL');
                    onClose();
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                    ${isSelected 
                      ? 'bg-earth-500 text-white shadow-md' 
                      : 'text-earth-700 dark:text-stone-300 hover:bg-earth-200 dark:hover:bg-stone-700'
                    }
                  `}
                >
                  <span className="w-5 flex justify-center"><Icon size={18} /></span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
        
        <div className="absolute bottom-8 left-0 w-full px-6">
          <button 
            onClick={() => {
                onSelectCategory(Category.GAY);
                onClose();
            }}
            className="w-full py-3 bg-[#ebe3d5] dark:bg-stone-700 hover:bg-[#e2d8c9] dark:hover:bg-stone-600 text-[#8c7b6d] dark:text-earth-200 rounded-xl text-sm font-bold shadow-soft transition-all active:scale-95 flex items-center justify-center gap-2 border border-[#d4c5a8]/30 dark:border-stone-600"
          >
            <Sparkles size={16} className="text-[#a89988]" />
            <span>甲片 ver.</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
