import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const { password, data } = req.body;

  // 1. 驗證密碼
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ message: '密碼錯誤，拒絕寫入' });
  }

  // 2. 徹底過濾掉會導致報錯的欄位
  // 我們只拿我們需要的，其餘一律丟棄
  const cleanData = {
    title: data.title,
    author: data.author,
    category: data.category,
    rating: data.rating,
    note: data.note,
    coverUrl: data.coverUrl,
    plurkUrl: data.plurkUrl,
    tags: data.tags || [],
    library_type: data.library_type
  };

  // 3. 執行寫入
  const { data: insertedData, error } = await supabase
    .from('collection')
    .insert([cleanData])
    .select();

  if (error) {
    console.error('Supabase Error:', error);
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json(insertedData);
}
