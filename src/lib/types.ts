export type BookingStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'no_show'
  | 'payment_review'

export interface Service {
  id: string
  name: string
  description: string | null
  duration_min: number
  price: number
  deposit: number
  is_active: boolean
  sort_order: number
}

export interface BusinessHours {
  weekday: number // 0=domingo … 6=sábado
  open_time: string // "HH:MM:SS"
  close_time: string
  is_active: boolean
}

export interface Booking {
  id: string
  service_id: string
  booking_date: string // "YYYY-MM-DD"
  start_time: string
  end_time: string
  client_name: string
  client_phone: string
  client_email: string | null
  status: BookingStatus
  deposit_amount: number
  payment_method: 'mp' | 'cash'
  promo_code: string | null
  discount_amount: number
  mp_preference_id: string | null
  mp_payment_id: string | null
  expires_at: string | null
  created_at: string
}

export interface Movement {
  id: string
  tipo: 'ingreso' | 'gasto'
  descripcion: string
  monto: number
  fecha: string // "YYYY-MM-DD"
  created_at: string
}

export interface Comment {
  id: string
  author_name: string
  content: string
  is_approved: boolean
  created_at: string
}

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending_payment: 'Pendiente de pago',
  confirmed: 'Confirmado',
  cancelled: 'Cancelado',
  completed: 'Completado',
  no_show: 'No vino',
  payment_review: 'Revisar pago',
}
