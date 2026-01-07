export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send();
  const { password, ...body } = req.body;
  if (password !== process.env.ADMIN_PASSWORD) return res.status(401).json({ error: '密碼錯誤' });

  await fetch(`${process.env.SUPABASE_URL}/rest/v1/collection`, {
    method: 'POST',
    headers: {
      'apikey': process.env.SUPABASE_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ ...body, createdAt: Date.now() })
  });
  res.status(200).json({ message: '成功新增' });
}
