-- Don Valdez — caja: registro de ingresos y gastos
-- (cortes cobrados, ventas de indumentaria, compra de insumos, etc.)

create table movements (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('ingreso', 'gasto')),
  descripcion text not null,
  monto numeric(10,2) not null check (monto > 0),
  fecha date not null default current_date,
  created_at timestamptz not null default now()
);

create index movements_fecha_idx on movements (fecha);

alter table movements enable row level security;

-- Info financiera: solo el admin autenticado, sin acceso público
create policy movements_admin_all on movements
  for all to authenticated using (true) with check (true);
