export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send();
  
  const { password, ...body } = req.body;

  // 1. 檢查管理員密碼
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: '密碼錯誤' });
  }

  // 2. 送去 Supabase (移除了會報錯的 createdAt)
  const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/collection`, {
    method: 'POST',
    headers: {
      'apikey': process.env.SUPABASE_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(body) // 直接傳送資料，Supabase 會自動填入 created_at
  });

  if (response.ok) {
    res.status(200).json({ message: '成功存入資料庫！' });
  } else {
    const errorData = await response.json();
    res.status(500).json({ error: `資料庫拒絕了！原因：${errorData.message}` });
  }
}
