import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { shipping, items, payment_method } = await request.json()

  if (!shipping || !items?.length || !payment_method) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data, error } = await supabase.rpc('create_order_atomic', {
    p_buyer_id: user.id,
    p_shipping: {
      name: shipping.name, phone: shipping.phone,
      address1: shipping.address1, address2: shipping.address2 ?? null,
      city: shipping.city, state: shipping.state, pincode: shipping.pincode,
    },
    p_items: items,
    p_payment_method: payment_method,
  })

  if (error) {
    console.error('Order creation error:', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(data)
}
