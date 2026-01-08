export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send();
  
  const { password, ...body } = req.body;

  // 1. 檢查密碼
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: '密碼錯誤' });
  }

  // 2. 真正送去 Supabase
  const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/collection`, {
    method: 'POST',
    headers: {
      'apikey': process.env.SUPABASE_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal' // 要求資料庫至少回點什麼
    },
    body: JSON.stringify({ ...body, createdAt: Date.now() })
  });

  // --- 重點：檢查資料庫到底有沒有點頭 ---
  if (response.ok) {
    res.status(200).json({ message: '成功存入資料庫！' });
  } else {
    const errorData = await response.json();
    console.error('Supabase 報錯了：', errorData);
    res.status(500).json({ error: `資料庫拒絕了！原因：${errorData.message || '未知錯誤'}` });
  }
}
