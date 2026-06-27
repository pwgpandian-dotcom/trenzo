import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_data } = await request.json()

  // Verify HMAC-SHA256 signature
  const body = `${razorpay_order_id}|${razorpay_payment_id}`
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest('hex')

  if (expected !== razorpay_signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Signature verified — create the order
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { shipping, items } = order_data
  const { data, error } = await supabase.rpc('create_order_atomic', {
    p_buyer_id: user.id,
    p_shipping: {
      name: shipping.name, phone: shipping.phone,
      address1: shipping.address1, address2: shipping.address2 ?? null,
      city: shipping.city, state: shipping.state, pincode: shipping.pincode,
    },
    p_items: items,
    p_payment_method: 'online',
    p_razorpay_order_id: razorpay_order_id,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Mark payment as paid
  await supabase.from('orders')
    .update({
      payment_status: 'paid',
      razorpay_payment_id,
      razorpay_signature,
    })
    .eq('razorpay_order_id', razorpay_order_id)

  return NextResponse.json({ success: true, ...data })
}
