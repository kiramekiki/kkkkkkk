import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const { password, id, data } = req.body;

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ message: '密碼錯誤' });
  }

  // 1. 只挑選資料庫允許更新的欄位
  const updateData = {
    title: data.title,
    author: data.author,
    category: data.category,
    rating: data.rating,
    note: data.note,
    coverUrl: data.coverUrl,
    plurkUrl: data.plurkUrl,
    tags: data.tags,
    library_type: data.library_type
  };

  // 2. 執行更新
  const { data: updatedData, error } = await supabase
    .from('collection')
    .update(updateData)
    .eq('id', id)
    .select();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json(updatedData);
}
