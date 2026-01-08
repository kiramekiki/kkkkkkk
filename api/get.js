export default async function handler(req, res) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  // 直接抓取 collection 表格裡的所有資料
  const response = await fetch(`${supabaseUrl}/rest/v1/collection?select=*`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });

  const data = await response.json();
  res.status(200).json(data);
}
