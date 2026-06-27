import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ item_id: string }> }
) {
  const { item_id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { status, tracking_id } = await request.json()
  const itemId = parseInt(item_id)

  // Verify seller owns this item
  const { data: item } = await supabase
    .from('order_items')
    .select('id, order_id, seller_id')
    .eq('id', itemId)
    .single()

  if (!item || item.seller_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const updateData: Record<string, unknown> = { item_status: status }
  if (tracking_id) updateData.tracking_id = tracking_id
  if (status === 'shipped') updateData.shipped_at = new Date().toISOString()
  if (status === 'delivered') updateData.delivered_at = new Date().toISOString()

  const { error } = await supabase
    .from('order_items')
    .update(updateData)
    .eq('id', itemId)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Check if all items in this order are delivered → update order status
  if (status === 'delivered') {
    const { data: allItems } = await supabase
      .from('order_items')
      .select('item_status')
      .eq('order_id', item.order_id)

    const allDelivered = allItems?.every(i => i.item_status === 'delivered' || i.item_status === 'cancelled')
    if (allDelivered) {
      await supabase.from('orders').update({ order_status: 'delivered' }).eq('id', item.order_id)
    }
  }

  return NextResponse.json({ success: true })
}
