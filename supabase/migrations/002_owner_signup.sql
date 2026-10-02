-- Fix handle_new_user trigger to persist role and is_owner from signup metadata

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_role user_role;
begin
  v_role := coalesce(
    (new.raw_user_meta_data ->> 'role')::user_role,
    'seeker'::user_role
  );

  insert into public.profiles (id, email, full_name, phone, role, is_owner)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone',
    v_role,
    v_role = 'owner'
  )
  on conflict (id) do update
    set
      email    = excluded.email,
      full_name = excluded.full_name,
      phone    = excluded.phone,
      role     = excluded.role,
      is_owner = excluded.is_owner;

  return new;
end;
$$;
