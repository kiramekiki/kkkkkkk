import { createClient } from '@supabase/supabase-js';

// 初始化 Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const adminPassword = process.env.ADMIN_PASSWORD;

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // 1. 只允許 POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { password, data } = req.body;

    // 2. 驗證密碼
    if (!password || password !== adminPassword) {
      return res.status(401).json({ error: '密碼錯誤' });
    }

    // 3. 根據你的資料庫截圖，精確提取欄位（不多傳，也不少傳）
    // 排除 createdAt, library_type 等資料庫不存在的欄位
    const payload = {
      title: data.title || '未命名',
      author: data.author || '未知',
      category: data.category || '全部',
      rating: data.rating || '0',
      note: data.note || '',
      coverUrl: data.coverUrl || '',
      plurkUrl: data.plurkUrl || '',
      tags: Array.isArray(data.tags) ? data.tags : []
    };

    // 4. 執行寫入
    const { data: result, error: dbError } = await supabase
      .from('collection')
      .insert([payload])
      .select();

    // 5. 如果資料庫報錯
    if (dbError) {
      return res.status(400).json({ error: dbError.message });
    }

    // 6. 成功回傳
    return res.status(200).json(result);

  } catch (err) {
    // 7. 攔截任何程式碼崩潰，並回傳 JSON 格式的錯誤
    return res.status(500).json({ error: 'API 內部崩潰', details: err.message });
  }
}
