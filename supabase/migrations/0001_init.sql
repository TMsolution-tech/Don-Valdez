-- Don Valdez — schema inicial
-- Timezone del negocio: America/Argentina/Salta (UTC-3, sin DST)

create table services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  duration_min integer not null default 30 check (duration_min > 0),
  price numeric(10,2) not null default 0,
  deposit numeric(10,2) not null default 0,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Varios rangos por día permiten turno mañana + tarde (siesta)
create table business_hours (
  weekday smallint not null check (weekday between 0 and 6), -- 0=domingo
  open_time time not null,
  close_time time not null,
  is_active boolean not null default true,
  primary key (weekday, open_time),
  check (close_time > open_time)
);

create table blocked_dates (
  date date primary key,
  reason text
);

create table bookings (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references services(id),
  booking_date date not null,
  start_time time not null,
  end_time time not null,
  client_name text not null,
  client_phone text not null,
  client_email text,
  status text not null default 'pending_payment' check (
    status in ('pending_payment', 'confirmed', 'cancelled', 'completed', 'no_show', 'payment_review')
  ),
  deposit_amount numeric(10,2) not null,
  mp_preference_id text,
  mp_payment_id text,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index bookings_date_idx on bookings (booking_date);
create index bookings_mp_payment_idx on bookings (mp_payment_id) where mp_payment_id is not null;

-- Grilla de 15 min: cada turno ocupa N celdas. La PK evita doble reserva.
create table booking_slot_locks (
  booking_date date not null,
  slot_time time not null,
  booking_id uuid not null references bookings(id) on delete cascade,
  primary key (booking_date, slot_time)
);

create table comments (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  content text not null,
  is_approved boolean not null default true,
  created_at timestamptz not null default now()
);

-- Al cancelar un turno se liberan sus celdas automáticamente
create or replace function release_locks_on_cancel()
returns trigger language plpgsql as $$
begin
  if new.status = 'cancelled' and old.status is distinct from 'cancelled' then
    delete from booking_slot_locks where booking_id = new.id;
  end if;
  return new;
end;
$$;

create trigger trg_release_locks
after update of status on bookings
for each row execute function release_locks_on_cancel();

-- Expira reservas pendientes de pago (el trigger libera los locks)
create or replace function expire_stale_bookings()
returns integer language plpgsql as $$
declare n integer;
begin
  update bookings set status = 'cancelled'
  where status = 'pending_payment' and expires_at < now();
  get diagnostics n = row_count;
  return n;
end;
$$;

-- Crea la reserva y sus locks atómicamente. Conflictos → excepción.
create or replace function create_booking(
  p_service_id uuid,
  p_date date,
  p_start time,
  p_name text,
  p_phone text,
  p_email text default null
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

  v_end := p_start + make_interval(mins => v_service.duration_min);

  -- Wraparound: si el turno cruza medianoche queda fuera de horario
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
    deposit_amount, expires_at
  ) values (
    p_service_id, p_date, p_start, v_end,
    p_name, p_phone, p_email,
    v_service.deposit, now() + interval '30 minutes'
  ) returning id into v_id;

  -- Locks cada 15 min dentro del intervalo ocupado
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

-- Reintenta tomar los locks de un turno (webhook confirma tras expiración).
-- Devuelve false si alguna celda ya está ocupada por otro turno.
create or replace function try_relock_booking(p_booking_id uuid)
returns boolean language plpgsql as $$
declare
  v bookings%rowtype;
begin
  select * into v from bookings where id = p_booking_id;
  if not found then return false; end if;
  begin
    insert into booking_slot_locks (booking_date, slot_time, booking_id)
    select v.booking_date, g::time, v.id
    from generate_series(
      (v.booking_date + v.start_time)::timestamp,
      (v.booking_date + v.end_time)::timestamp - interval '15 minutes',
      interval '15 minutes'
    ) g
    on conflict (booking_date, slot_time) do nothing;
    -- si faltan celdas, hubo conflicto parcial: soltar lo que tomamos
    if exists (
      select 1
      from generate_series(
        (v.booking_date + v.start_time)::timestamp,
        (v.booking_date + v.end_time)::timestamp - interval '15 minutes',
        interval '15 minutes'
      ) g
      where not exists (
        select 1 from booking_slot_locks l
        where l.booking_date = v.booking_date
          and l.slot_time = g::time
          and l.booking_id = v.id
      )
    ) then
      delete from booking_slot_locks where booking_id = v.id;
      return false;
    end if;
    return true;
  end;
end;
$$;

-- Las RPCs solo las puede llamar el servidor (service role).
-- Sin esto, cualquiera con la anon key podría reservar sin pagar.
revoke all on function create_booking(uuid, date, time, text, text, text) from public;
revoke all on function expire_stale_bookings() from public;
revoke all on function try_relock_booking(uuid) from public;
revoke all on function release_locks_on_cancel() from public;
grant execute on function create_booking(uuid, date, time, text, text, text) to service_role;
grant execute on function expire_stale_bookings() to service_role;
grant execute on function try_relock_booking(uuid) to service_role;

-- RLS ------------------------------------------------------------
alter table services enable row level security;
alter table business_hours enable row level security;
alter table blocked_dates enable row level security;
alter table bookings enable row level security;
alter table booking_slot_locks enable row level security;
alter table comments enable row level security;

-- Lectura pública (anon): solo datos no sensibles
create policy services_public_read on services
  for select to anon using (is_active);
create policy business_hours_public_read on business_hours
  for select to anon using (true);
create policy blocked_dates_public_read on blocked_dates
  for select to anon using (true);
create policy comments_public_read on comments
  for select to anon using (is_approved);

-- El dueño (usuario autenticado) tiene acceso total
create policy services_admin_all on services
  for all to authenticated using (true) with check (true);
create policy business_hours_admin_all on business_hours
  for all to authenticated using (true) with check (true);
create policy blocked_dates_admin_all on blocked_dates
  for all to authenticated using (true) with check (true);
create policy bookings_admin_all on bookings
  for all to authenticated using (true) with check (true);
create policy locks_admin_all on booking_slot_locks
  for all to authenticated using (true) with check (true);
create policy comments_admin_all on comments
  for all to authenticated using (true) with check (true);
