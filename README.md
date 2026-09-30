# Don Valdez · Barber Studio

Sitio con turnero online + seña por Mercado Pago (Checkout Pro) y comentarios de clientes.

Stack: Next.js 16 · React 19 · Supabase · Tailwind 4 · zod · SDK `mercadopago` v3.

## Setup

1. **Supabase** (cuenta TM Soluciones Digitales)
   - Crear proyecto en supabase.com.
   - En SQL Editor: correr `supabase/migrations/0001_init.sql` y luego `supabase/seed.sql`.
   - En Authentication → Users: crear el usuario del dueño (email + contraseña) para entrar a `/admin`.

2. **Variables de entorno**
   - Copiar `env.example` → `.env.local` y completar URL + anon key + service role key del proyecto.

3. **Mercado Pago**
   - Obtener el Access Token en developers.mercadopago.com → Tus integraciones.
   - Ponerlo en `MP_ACCESS_TOKEN`.
   - En Webhooks configurar `https://<dominio>/api/mp/webhook` (topic: payment) y copiar el secreto de firma en `MP_WEBHOOK_SECRET`.
   - `NEXT_PUBLIC_SITE_URL` debe ser la URL pública (MP redirige ahí tras el pago).

4. **Correr**
   ```bash
   npm install
   npm run dev
   ```

## Estructura

- `/` landing (servicios, horarios, comentarios)
- `/turnos` wizard de reserva (invitado: nombre + teléfono)
- `/turnos/resultado` estado post-pago (polling)
- `/admin` panel del dueño: turnos del día, servicios, horarios, días bloqueados, comentarios
- `POST /api/bookings` crea la reserva (pending) + preferencia MP → devuelve `init_point`
- `POST /api/mp/webhook` confirma/cancela el turno según el pago

## Modelo de reserva

- La grilla es de 15 min. Cada turno toma locks en `booking_slot_locks` (PK = fecha+hora) → imposible doble reserva.
- Seña pendiente 30 min; si no se paga, `expire_stale_bookings()` cancela y libera la grilla.
- Pagos diferidos (efectivo MP) extienden a 72 h.
- Pago aprobado sobre turno ya cancelado → `payment_review` para que el dueño lo resuelva a mano.

## Pendiente del cliente

- Logo y tipografía oficiales (placeholders: "DV" + Bebas Neue/Inter).
- Dirección del local en `InfoSection`.
- Precios reales de servicios (editables en `/admin`).
