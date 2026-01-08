export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send();
  
  // 同樣在這裡把 createdAt 踢掉
  const { id, password, createdAt, ...body } = req.body;

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: '密碼錯誤' });
  }

  const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/collection?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      'apikey': process.env.SUPABASE_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(body)
  });

  if (response.ok) {
    res.status(200).json({ message: '修改成功！' });
  } else {
    const errorData = await response.json();
    res.status(500).json({ error: `修改失敗！原因：${errorData.message}` });
  }
}
