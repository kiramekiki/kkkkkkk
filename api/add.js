import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // 配合你的 AddEntryModal，直接從 body 拿資料
    const { 
      password, title, author, category, 
      rating, note, tags, coverUrl, plurkUrl 
    } = req.body;

    // 1. 驗證密碼
    if (!password || password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: '密碼錯誤，請重新輸入' });
    }

    // 2. 建立要存入 Supabase 的物件 (對齊你的截圖)
    // 絕對不包含 createdAt 或任何多餘欄位
    const payload = {
      title: title || '無標題',
      author: author || '未知',
      category: category,
      rating: rating,
      note: note || '',
      coverUrl: coverUrl || '',
      plurkUrl: plurkUrl || '',
      tags: Array.isArray(tags) ? tags : []
    };

    // 3. 寫入資料庫
    const { data: result, error: dbError } = await supabase
      .from('collection')
      .insert([payload])
      .select();

    if (dbError) {
      return res.status(400).json({ error: dbError.message });
    }

    return res.status(200).json(result);

  } catch (err) {
    // 攔截代碼錯誤，回傳 JSON 防止前端 Unexpected token 'A'
    return res.status(500).json({ error: '伺服器內部錯誤', details: err.message });
  }
}
