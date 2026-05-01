# Payment Workflow

## Overview
This document describes the payment workflow implemented in the Pooja Enterprise B2B platform.

The current implementation uses a UPI proof-based verification model:
- Customer pays using UPI QR or UPI deep link.
- Customer submits UTR and screenshot proof.
- Admin verifies and approves or rejects payment.

## Actors
- Customer (Client)
- Admin
- System (Frontend + API + Database)

## Workflow Steps

### 1. Checkout Initiation
1. Customer adds products to cart.
2. Customer proceeds to checkout.
3. System calculates total amount (subtotal + tax + shipping - discounts).
4. Customer selects payment method as UPI.
5. System redirects customer to payment page with dynamic amount.

### 2. Payment Order Creation
1. Payment page calls POST /api/create-order with amount.
2. Backend creates a unique payment order entry in payment_orders table.
3. Initial status is set to pending.
4. System returns:
   - payment record id
   - unique payment order id
   - amount
   - status

### 3. UPI Payment Execution
1. Payment page shows:
   - static UPI QR image
   - UPI ID
   - amount
   - payment order id
2. Customer can click Pay Now to open UPI deep link.
3. Customer completes payment in UPI app.

### 4. Proof Submission
1. Customer enters UTR (transaction reference).
2. Customer uploads screenshot of successful payment.
3. Payment page submits multipart form to POST /api/submit-proof.
4. Backend validates fields and file type.
5. Backend stores screenshot in public/uploads/payment-proofs.
6. Backend updates payment_orders:
   - utr
   - screenshot_url
   - status = verification_pending

### 5. Receipt Generation
1. Customer can manually click Download Receipt on payment page.
2. After successful proof submission, receipt is auto-downloaded.
3. Receipt is generated in browser as HTML file and includes:
   - merchant name
   - UPI ID
   - payment order id
   - amount
   - status
   - UTR
   - generated timestamp

### 6. Admin Verification
1. Admin opens payment management panel.
2. Admin reviews each payment proof:
   - order id
   - amount
   - UTR
   - screenshot
   - current status
3. Admin action:
   - approve -> status changes to paid
   - reject -> status changes to rejected
4. Backend updates payment_orders status via admin API.

### 7. Final States
Payment status lifecycle:
- pending
- verification_pending
- paid
- rejected

Only admin can move verification_pending to paid or rejected.

## APIs Used in Workflow
- POST /api/create-order
- POST /api/submit-proof
- GET /api/admin/payments
- PATCH /api/admin/payments/[orderId]

## Database Table Involved
- payment_orders

Key fields:
- id
- order_id
- client_id
- amount
- status
- utr
- screenshot_url
- created_at
- updated_at

## Security and Validation Notes
- Session token is used to associate payment with logged-in client when available.
- Screenshot upload accepts safe image extensions.
- Admin APIs are protected by admin session authentication.

## Current Limitation
This is a proof-based verification workflow, not an auto-capture gateway flow.
There is no direct gateway SDK integration (for example Razorpay or Stripe webhook confirmation).

## Future Enhancement Suggestions
1. Add Razorpay or Stripe for automated payment confirmation.
2. Generate server-side signed PDF receipts.
3. Link paid payment directly to order payment_status update.
4. Add payment audit trail with admin remarks.
5. Add email receipt delivery after admin approval.
