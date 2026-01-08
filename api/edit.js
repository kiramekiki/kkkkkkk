import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { password, id, data } = req.body;

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ message: '密碼錯誤' });
  }

  // 重點：排除掉所有「不允許更新」或「名稱不對」的欄位
  // id 不可以放在 update 的 body 裡，createdAt 是資料庫自動管理的
  const { createdAt, created_at, id: _, ...updateData } = data;

  const { data: updatedData, error } = await supabase
    .from('collection')
    .update(updateData)
    .eq('id', id)
    .select();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json(updatedData);
}
