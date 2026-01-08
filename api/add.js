import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  const { password, data } = req.body;

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ message: '密碼錯誤' });
  }

  // 強制白名單：只拿你截圖裡有的這 8 個欄位
  // 這樣寫法保證絕對不會有 "createdAt" 漏網之魚
  const payload = {
    title: data.title || '',
    author: data.author || '',
    category: data.category || '',
    rating: data.rating || '',
    note: data.note || '',
    coverUrl: data.coverUrl || '',
    plurkUrl: data.plurkUrl || '',
    tags: Array.isArray(data.tags) ? data.tags : []
  };

  // 執行寫入
  const { data: result, error } = await supabase
    .from('collection')
    .insert([payload])
    .select();

  if (error) {
    console.error('Supabase 報錯:', error);
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json(result);
}
