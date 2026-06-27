import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'

export async function POST(request: Request) {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return NextResponse.json({ error: 'Razorpay not configured' }, { status: 503 })
  }

  const { amount_paise, receipt } = await request.json()
  if (!amount_paise || amount_paise < 100) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
  }

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  })

  const order = await razorpay.orders.create({
    amount: amount_paise,
    currency: 'INR',
    receipt: receipt ?? `rcpt_${Date.now()}`,
  })

  return NextResponse.json({
    id: order.id,
    amount: order.amount,
    currency: order.currency,
    key_id: process.env.RAZORPAY_KEY_ID,
  })
}
