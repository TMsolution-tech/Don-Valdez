-- Categoría en cada movimiento de caja (para el gráfico del admin)
alter table movements
  add column categoria text not null default 'varios';
