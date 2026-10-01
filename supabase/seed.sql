-- Datos iniciales (precios de ejemplo — editables desde /admin)

insert into services (name, description, duration_min, price, deposit, sort_order) values
  ('Corte clásico', 'Corte a tijera y/o máquina, terminación con navaja.', 60, 18000, 6000, 1),
  ('Corte + barba', 'Corte completo más arreglo y perfilado de barba.', 60, 25000, 8000, 2),
  ('Barba / perfilado', 'Arreglo de barba con toalla caliente y navaja.', 60, 12000, 4000, 3),
  ('Fade / diseño', 'Degradé prolijo con diseño opcional.', 60, 22000, 7000, 4),
  ('Corte niño', 'Hasta 12 años.', 60, 15000, 5000, 5);

-- Lun–Vie: 9–13 y 16–20:30 · Sáb: 9–14 · Dom: cerrado
insert into business_hours (weekday, open_time, close_time) values
  (1, '09:00', '13:00'), (1, '16:00', '20:30'),
  (2, '09:00', '13:00'), (2, '16:00', '20:30'),
  (3, '09:00', '13:00'), (3, '16:00', '20:30'),
  (4, '09:00', '13:00'), (4, '16:00', '20:30'),
  (5, '09:00', '13:00'), (5, '16:00', '20:30'),
  (6, '09:00', '14:00');

insert into comments (author_name, content) values
  ('Clientes de Don Valdez', 'Los comentarios reales de tus clientes van a aparecer acá.');
