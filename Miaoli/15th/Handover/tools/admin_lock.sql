-- ============================================================
-- 苗栗IMC 第15屆｜訂單「只有管理者能刪除」的資料庫端鎖定
-- 在 Supabase 的 SQL Editor 貼上執行（由你自己執行；執行前請先改掉下面的管理者密碼）。
-- 目前 h15_orders 對 anon 開放 SELECT/INSERT/UPDATE/DELETE（任何知道網站金鑰的人都能呼叫），
-- 後台的「刪除」按鈕只靠前端擋；執行本檔後，刪除只能透過 admin_delete_order 並輸入正確密碼。
-- ============================================================

-- 1) 管理者專用刪除函式（密碼只存在這裡，不在網頁程式裡）
create or replace function public.admin_delete_order(p_order_no text, p_code text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare n integer;
begin
  if p_code is distinct from '請改成你自己的管理者密碼' then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  delete from public.h15_orders where order_no = p_order_no;
  get diagnostics n = row_count;
  return n;
end;
$$;

revoke all on function public.admin_delete_order(text, text) from public;
grant execute on function public.admin_delete_order(text, text) to anon;

-- 2) 拿掉 anon 直接刪除訂單的權限（之後只能走上面的函式）
drop policy if exists "h15 anon delete orders" on public.h15_orders;

-- 還原方式（需要時）：
--   create policy "h15 anon delete orders" on public.h15_orders for delete to anon using (true);
