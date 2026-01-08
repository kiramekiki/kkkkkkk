export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send();
  const { id, password } = req.body;
  if (password !== process.env.ADMIN_PASSWORD) return res.status(401).json({ error: '密碼錯誤' });

  await fetch(`${process.env.SUPABASE_URL}/rest/v1/collection?id=eq.${id}`, {
    method: 'DELETE',
    headers: {
      'apikey': process.env.SUPABASE_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_KEY}`
    }
  });
  res.status(200).json({ message: '刪除成功' });
}
