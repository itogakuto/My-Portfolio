-- 1. topicsテーブルに image_url カラムがあるか確認し、なければ追加
-- 既存のテーブル構造を壊さないように、存在チェックを行ってからカラムを追加します。
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='topics' AND column_name='image_url') THEN
        ALTER TABLE public.topics ADD COLUMN image_url TEXT;
    END IF;
END $$;

-- 2. ストレージバケットの公開設定を再徹底
-- public = true にすることで、誰でもURL経由で画像を表示できるようになります。
UPDATE storage.buckets SET public = true WHERE id = 'images';

-- 3. ストレージポリシーの再適用（読み取り権限を全てのユーザーに）
DROP POLICY IF EXISTS "Allow Public Select" ON storage.objects;
CREATE POLICY "Allow Public Select" ON storage.objects 
FOR SELECT USING (bucket_id = 'images');

-- 4. 認証済みユーザーに全権限（アップロード・更新・削除）
DROP POLICY IF EXISTS "Allow Authenticated All" ON storage.objects;
CREATE POLICY "Allow Authenticated All" ON storage.objects 
FOR ALL TO authenticated 
USING (bucket_id = 'images') 
WITH CHECK (bucket_id = 'images');