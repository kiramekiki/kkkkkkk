export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send();
  
  // 1. 分離出 ID、密碼和其他要修改的內容
  const { id, password, ...body } = req.body;

  // 2. 檢查暗號
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: '暗號錯誤，不准修改！' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  // 3. 叫 Supabase 進行修改 (PATCH)
  const response = await fetch(`${supabaseUrl}/rest/v1/collection?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(body)
  });

  // 4. 確認結果
  if (response.ok) {
    res.status(200).json({ message: '修改成功！' });
  } else {
    const errorData = await response.json();
    res.status(500).json({ error: `修改失敗！原因：${errorData.message}` });
  }
}
