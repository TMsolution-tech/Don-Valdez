-- Don Valdez — turnos en efectivo + códigos de promoción
-- El descuento se aplica al precio total del servicio (lo que paga en el local)

create table promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount numeric(10,2) not null check (discount > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table bookings
  add column payment_method text not null default 'mp'
    check (payment_method in ('mp', 'cash')),
  add column promo_code text,
  add column discount_amount numeric(10,2) not null default 0;

-- create_booking con método de pago, promo y depósito sobreescribible
drop function if exists create_booking(uuid, date, time, text, text, text);

create or replace function create_booking(
  p_service_id uuid,
  p_date date,
  p_start time,
  p_name text,
  p_phone text,
  p_email text default null,
  p_payment_method text default 'mp',
  p_promo_code text default null,
  p_discount numeric default 0,
  p_deposit numeric default null
)
returns uuid language plpgsql as $$
declare
  v_service services%rowtype;
  v_end time;
  v_id uuid;
begin
  perform expire_stale_bookings();

  select * into v_service from services where id = p_service_id and is_active;
  if not found then raise exception 'SERVICIO_INVALIDO'; end if;

  if p_payment_method not in ('mp', 'cash') then
    raise exception 'METODO_INVALIDO';
  end if;

  v_end := p_start + make_interval(mins => v_service.duration_min);

  if v_end <= p_start then
    raise exception 'FUERA_DE_HORARIO';
  end if;

  if (p_date + p_start) <= now() at time zone 'America/Argentina/Salta' then
    raise exception 'TURNO_EN_EL_PASADO';
  end if;

  if exists (select 1 from blocked_dates where date = p_date) then
    raise exception 'FECHA_BLOQUEADA';
  end if;

  if not exists (
    select 1 from business_hours
    where weekday = extract(dow from p_date)::smallint
      and is_active
      and open_time <= p_start
      and close_time >= v_end
  ) then
    raise exception 'FUERA_DE_HORARIO';
  end if;

  insert into bookings (
    service_id, booking_date, start_time, end_time,
    client_name, client_phone, client_email,
    deposit_amount, expires_at,
    payment_method, promo_code, discount_amount, status
  ) values (
    p_service_id, p_date, p_start, v_end,
    p_name, p_phone, p_email,
    coalesce(p_deposit, v_service.deposit),
    case when p_payment_method = 'cash' then null else now() + interval '30 minutes' end,
    p_payment_method, p_promo_code, greatest(coalesce(p_discount, 0), 0),
    case when p_payment_method = 'cash' then 'confirmed' else 'pending_payment' end
  ) returning id into v_id;

  insert into booking_slot_locks (booking_date, slot_time, booking_id)
  select p_date, g::time, v_id
  from generate_series(
    (p_date + p_start)::timestamp,
    (p_date + v_end)::timestamp - interval '15 minutes',
    interval '15 minutes'
  ) g;

  return v_id;
end;
$$;

revoke all on function create_booking(uuid, date, time, text, text, text, text, text, numeric, numeric) from public;
grant execute on function create_booking(uuid, date, time, text, text, text, text, text, numeric, numeric) to service_role;

-- RLS: los códigos solo los toca el admin / el servidor (service role).
-- Sin lectura pública así no se listan los códigos.
alter table promo_codes enable row level security;
create policy promo_codes_admin_all on promo_codes
  for all to authenticated using (true) with check (true);
