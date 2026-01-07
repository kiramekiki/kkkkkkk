export default async function handler(req, res) {
  const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/collection?select=*`, {
    headers: {
      'apikey': process.env.SUPABASE_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_KEY}`
    }
  });
  const data = await response.json();
  res.status(200).json(data);
}
