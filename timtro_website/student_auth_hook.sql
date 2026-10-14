-- Run in Supabase SQL Editor, then select public.before_ueh_student_created
-- under Authentication > Hooks > Before User Created.
create or replace function public.before_ueh_student_created(event jsonb)
returns jsonb language plpgsql as $$
declare email text;
begin
 email := lower(event->'user'->>'email');
 if email is null or email !~ '^[a-z][a-z0-9_-]*\.[0-9]{6,15}@st\.ueh\.edu\.vn$' then
  return jsonb_build_object('error',jsonb_build_object('http_code',403,'message','Chỉ chấp nhận email sinh viên dạng ten.mssv@st.ueh.edu.vn'));
 end if;
 return '{}'::jsonb;
end;
$$;
grant execute on function public.before_ueh_student_created(jsonb) to supabase_auth_admin;
revoke execute on function public.before_ueh_student_created(jsonb) from anon,authenticated,public;
