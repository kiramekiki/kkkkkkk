export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send();
  
  // 這裡最關鍵：我們把 password 和 createdAt 拿出來，剩下的才叫 body
  // 這樣 createdAt 就不會被送進資料庫報錯了
  const { password, createdAt, ...body } = req.body;

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: '密碼錯誤' });
  }

  const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/collection`, {
    method: 'POST',
    headers: {
      'apikey': process.env.SUPABASE_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    // body 裡面現在保證沒有 createdAt 了
    body: JSON.stringify(body) 
  });

  if (response.ok) {
    res.status(200).json({ message: '成功存入資料庫！' });
  } else {
    const errorData = await response.json();
    res.status(500).json({ error: `資料庫拒絕了！原因：${errorData.message}` });
  }
}
