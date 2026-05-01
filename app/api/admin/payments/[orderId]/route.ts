import { NextRequest, NextResponse } from "next/server"
import { unlink } from "fs/promises"
import path from "path"
import { getSessionByToken, updatePaymentOrderStatus, getPaymentOrders, createOrderFromPaymentOrder, finalizeOrderPayment, setOrderStatus, deletePaymentOrderByOrderId } from "@/lib/db"
import type { ApiResponse } from "@/lib/types"

async function isAdminAuthenticated(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get("admin_session_token")?.value
  if (!token) return false

  const session = await getSessionByToken(token)
  return !!session && session.userType === "admin"
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    if (!await isAdminAuthenticated(request)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Admin authentication required" },
        { status: 401 }
      )
    }

    const { orderId } = await params
    const body = await request.json()
    const status = body?.status as "paid" | "rejected" | undefined

    if (status !== "paid" && status !== "rejected") {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "status must be 'paid' or 'rejected'" },
        { status: 400 }
      )
    }

    const updated = await updatePaymentOrderStatus(orderId, status)

    if (!updated) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Payment order not found" },
        { status: 404 }
      )
    }

    // If payment is marked as paid, create an Order from the payment order
    if (status === "paid") {
      console.log('Payment approved, looking for payment order:', orderId)
      
      // Find the payment order using the orderId (which is payment_orders.order_id)
      const paymentOrders = await getPaymentOrders()
      console.log('Total payment orders found:', paymentOrders.length)
      
      const paymentOrder = paymentOrders.find(p => {
        console.log('Comparing:', p.orderId, '===', orderId)
        return p.orderId === orderId
      })
      
      if (!paymentOrder) {
        console.error('Payment order not found in results for orderId:', orderId)
        return NextResponse.json<ApiResponse>({
          success: true,
          message: `Payment marked as ${status} (order not found in records)`,
        })
      }
      
      if (!paymentOrder.clientId) {
        console.error('Payment order has no clientId:', paymentOrder)
        return NextResponse.json<ApiResponse>({
          success: true,
          message: `Payment marked as ${status} (no client ID)`,
        })
      }
      
      try {
        console.log('Payment approved for payment order:', paymentOrder.id)

        // If a pending order was already created for this payment flow, finalize it
        if (paymentOrder.createdOrderId) {
          console.log('Finalizing existing order for payment:', paymentOrder.createdOrderId)
          const finalized = await finalizeOrderPayment(paymentOrder.createdOrderId)
          if (finalized) {
            return NextResponse.json<ApiResponse>({
              success: true,
              message: `Payment marked as ${status} and order ${paymentOrder.createdOrderId} finalized`,
            })
          } else {
            console.error('Failed to finalize existing order:', paymentOrder.createdOrderId)
            return NextResponse.json<ApiResponse>({
              success: true,
              message: `Payment marked as ${status} (failed to finalize existing order)`,
            })
          }
        }

        // Fallback: create order from payment order if no createdOrderId exists
        console.log('No existing order linked; creating order from payment order:', paymentOrder.id, 'for client:', paymentOrder.clientId)
        const order = await createOrderFromPaymentOrder(paymentOrder.id, paymentOrder.clientId)
        
        if (order) {
          console.log('Order created successfully:', order.id)
          return NextResponse.json<ApiResponse>({
            success: true,
            message: `Payment marked as ${status} and order created`,
          })
        } else {
          console.error('createOrderFromPaymentOrder returned null')
        }
      } catch (error) {
        console.error('Error creating/finalizing order from payment:', error instanceof Error ? error.message : error)
        return NextResponse.json<ApiResponse>({
          success: true,
          message: `Payment marked as ${status} (order creation/finalization had issues)`,
        })
      }
    }

    // If payment is rejected, cancel the linked order (if any)
    if (status === "rejected") {
      try {
        const paymentOrders = await getPaymentOrders()
        const paymentOrder = paymentOrders.find(p => p.orderId === orderId)
        if (paymentOrder && paymentOrder.createdOrderId) {
          const cancelled = await setOrderStatus(paymentOrder.createdOrderId, 'cancelled', 'failed')
          if (cancelled) {
            return NextResponse.json<ApiResponse>({
              success: true,
              message: `Payment marked as rejected and order ${paymentOrder.createdOrderId} cancelled`,
            })
          } else {
            console.error('Failed to cancel linked order:', paymentOrder.createdOrderId)
            return NextResponse.json<ApiResponse>({
              success: true,
              message: `Payment marked as rejected (failed to cancel linked order)`,
            })
          }
        }

        return NextResponse.json<ApiResponse>({
          success: true,
          message: `Payment marked as rejected (no linked order)`,
        })
      } catch (e) {
        console.error('Error handling rejected payment:', e)
        return NextResponse.json<ApiResponse>({
          success: true,
          message: `Payment marked as rejected (error processing linked order)`,
        })
      }
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: `Payment marked as ${status}`,
    })
  } catch (error) {
    console.error("Admin update payment status error:", error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: "Failed to update payment status" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    if (!await isAdminAuthenticated(request)) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Admin authentication required" },
        { status: 401 }
      )
    }

    const { orderId } = await params

    // Only allow deleting rejected payment orders
    const result = await deletePaymentOrderByOrderId(orderId)

    if (result.affectedRows === 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: "No rejected payment order found to delete",
      }, { status: 404 })
    }

    // If there was a screenshot file saved, remove it from disk
    if (result.screenshotPath) {
      try {
        // screenshotPath is like '/uploads/payment-proofs/filename.ext'
        const safePath = path.join(process.cwd(), 'public', result.screenshotPath.replace(/^\//, ''))
        await unlink(safePath)
        console.log('Removed payment screenshot:', safePath)
      } catch (e) {
        console.warn('Failed to remove screenshot file for deleted payment:', e)
      }
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Rejected payment deleted',
    })
  } catch (error) {
    console.error('Admin delete payment error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to delete payment' },
      { status: 500 }
    )
  }
}
