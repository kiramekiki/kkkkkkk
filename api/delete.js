export default async function handler(req, res) {
  // 1. 只准許 POST 請求
  if (req.method !== 'POST') return res.status(405).send();

  const { id, password } = req.body;

  // 2. 檢查管理員暗號
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: '暗號錯誤，不准刪除！' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  // 3. 叫 Supabase 刪除
  const response = await fetch(`${supabaseUrl}/rest/v1/collection?id=eq.${id}`, {
    method: 'DELETE',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });

  // --- 重點：確認是否真的刪除成功 ---
  if (response.ok) {
    res.status(200).json({ message: '刪除成功！' });
  } else {
    res.status(500).json({ error: '刪除失敗，請檢查資料庫連線。' });
  }
}
