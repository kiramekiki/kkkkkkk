import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // 強制設定回傳為 JSON 格式
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { password, ...data } = req.body;

    // 1. 檢查密碼
    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: '密碼錯誤，請檢查 Vercel 環境變數' });
    }

    // 2. 檢查 Supabase 連線資訊 (防止初始化崩潰)
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_KEY;

    if (!url || !key || !url.startsWith('https')) {
      return res.status(500).json({ 
        error: '環境變數設定錯誤', 
        details: '請檢查 SUPABASE_URL 是否包含 https，以及 KEY 是否為 eyJ 開頭' 
      });
    }

    const supabase = createClient(url, key);

    // 3. 根據你最新的截圖，精確準備欄位
    // 注意：如果你的資料表還有 author, note, coverUrl，請確保它們有出現在這
    const payload = {
      title: data.title || '無標題',
      category: data.category || '全部',
      rating: data.rating || '0',
      plurkUrl: data.plurkUrl || '',
      tags: Array.isArray(data.tags) ? data.tags : [],
      // 以下為之前討論過但截圖中被遮住的欄位，如果資料表沒有，請刪除這三行
      author: data.author || '未知',
      note: data.note || '',
      coverUrl: data.coverUrl || ''
    };

    // 4. 執行 Insert
    const { data: result, error: dbError } = await supabase
      .from('collection')
      .insert([payload])
      .select();

    if (dbError) {
      return res.status(400).json({ error: '資料庫寫入失敗', message: dbError.message });
    }

    return res.status(200).json(result);

  } catch (err) {
    // 這是最後防線：即使當機也要回傳 JSON
    return res.status(500).json({ 
      error: '伺服器執行崩潰', 
      message: err.message 
    });
  }
}
