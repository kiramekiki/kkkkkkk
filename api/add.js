import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const { password, data } = req.body;

  // 1. 驗證密碼
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ message: '密碼錯誤' });
  }

  // 2. 精準過濾：只挑選你截圖中有的 8 個欄位
  // 這樣保證絕對不會有 "createdAt" 漏網之魚
  const cleanData = {
    title: data.title || '無標題',
    author: data.author || '未知作者',
    category: data.category || '全部',
    rating: data.rating || '0.0',
    note: data.note || '',
    coverUrl: data.coverUrl || '',
    plurkUrl: data.plurkUrl || '',
    tags: Array.isArray(data.tags) ? data.tags : []
  };

  // 3. 執行寫入
  const { data: insertedData, error } = await supabase
    .from('collection')
    .insert([cleanData])
    .select();

  if (error) {
    console.error('Supabase Error:', error.message);
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json(insertedData);
}
