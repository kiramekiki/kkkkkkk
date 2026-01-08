import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { password, data } = req.body;

  // 1. 驗證密碼
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ message: '密碼錯誤' });
  }

  // 2. 重點：解構賦值，把 createdAt 抓出來但不使用它，將剩餘的存入 cleanData
  // 同時也要排除 id，因為新增時 id 由資料庫自動生成
  const { createdAt, id, ...cleanData } = data;

  const { data: insertedData, error } = await supabase
    .from('collection')
    .insert([cleanData]) // 這裡只傳送 cleanData
    .select();

  if (error) {
    console.error('Supabase Error:', error);
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json(insertedData);
}
