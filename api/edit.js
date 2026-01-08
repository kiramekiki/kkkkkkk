import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { 
      id, password, title, author, category, 
      rating, note, tags, coverUrl, plurkUrl 
    } = req.body;

    if (!password || password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: '密碼錯誤' });
    }

    const updateData = {
      title, author, category, rating, note, tags, coverUrl, plurkUrl
    };

    const { data: result, error: dbError } = await supabase
      .from('collection')
      .update(updateData)
      .eq('id', id)
      .select();

    if (dbError) return res.status(400).json({ error: dbError.message });
    return res.status(200).json(result);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
