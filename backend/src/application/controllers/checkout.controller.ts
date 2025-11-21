import { Stripe } from 'stripe';
import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authentication';
import Order from '../../data/models/Order';

interface Item {
  name: string;
  price: number;
  quantity: number;
}

export class CheckoutController {
  createCheckoutSession = async (req: Request, res: Response): Promise<Response> => {
    try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
        const { items } = req.body as { items: Item[] };

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: "Items array is required" });
        }

        const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item) => ({
            price_data: {
            currency: 'thb',
            product_data: {
                name: item.name,
            },
            unit_amount: item.price * 100,
            },
            quantity: item.quantity,
        }));

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        
        const session = await stripe.checkout.sessions.create({
        payment_method_types: ['promptpay'],
        mode: 'payment',
        line_items,
        success_url: `${frontendUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${frontendUrl}/cancel`,
        locale: 'th',
        submit_type: 'pay',
        // Customization options
        custom_text: {
          submit: {
            message: 'กดปุ่มด้านล่างเพื่อชำระเงินผ่าน PromptPay',
          },
        },
        });


        if (!session.url) {
            return res.status(500).json({ error: "Failed to create session URL" });
        }

        return res.status(200).json({ url: session.url });

    } catch (err: unknown) {
        if (err instanceof Error) {
            return res.status(500).json({ error: err.message });
        }
        return res.status(500).json({ error: 'Unknown error' });
    }
  };

  // Create Payment Intent for Stripe Elements
  createPaymentIntent = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { orderId } = req.body as { orderId: string };

      if (!orderId) {
        return res.status(400).json({ error: "Order ID is required" });
      }

      // Fetch order
      const order = await Order.findById(orderId)
        .populate('buyer', 'name kuEmail')
        .populate('seller', 'name contact');

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      // Verify order belongs to user
      if (String(order.buyer._id) !== userId) {
        return res.status(403).json({ error: "You don't have permission to pay for this order" });
      }

      // Verify order status and payment method
      if (order.paymentMethod !== 'promptpay') {
        return res.status(400).json({ error: "This order does not use PromptPay payment" });
      }

      if (order.paymentStatus === 'paid') {
        return res.status(400).json({ error: "This order has already been paid" });
      }

      if (order.status !== 'confirmed') {
        return res.status(400).json({ error: "Order must be confirmed by seller before payment" });
      }

      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

      // Calculate total amount
      const totalAmount = order.items.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
      }, 0);

      // Create Payment Intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalAmount * 100), // Convert to satang
        currency: 'thb',
        payment_method_types: ['promptpay'],
        metadata: {
          orderId: orderId,
          userId: userId,
        },
      });

      return res.status(200).json({
        clientSecret: paymentIntent.client_secret,
        orderId: orderId,
        amount: totalAmount,
      });

    } catch (err: unknown) {
      if (err instanceof Error) {
        return res.status(500).json({ error: err.message });
      }
      return res.status(500).json({ error: 'Unknown error' });
    }
  };

  // Confirm payment after successful payment
  confirmPayment = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { paymentIntentId, orderId } = req.body as { paymentIntentId: string; orderId: string };

      if (!paymentIntentId || !orderId) {
        return res.status(400).json({ error: "Payment Intent ID and Order ID are required" });
      }

      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

      // Retrieve payment intent to verify
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ error: "Payment has not been completed" });
      }

      // Verify order
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      if (String(order.buyer) !== userId) {
        return res.status(403).json({ error: "You don't have permission to confirm this payment" });
      }

      // Update order payment status
      order.paymentStatus = 'paid';
      order.paymentIntentId = paymentIntentId;
      await order.save();

      return res.status(200).json({
        success: true,
        message: "Payment confirmed successfully",
        orderId: orderId,
      });

    } catch (err: unknown) {
      if (err instanceof Error) {
        return res.status(500).json({ error: err.message });
      }
      return res.status(500).json({ error: 'Unknown error' });
    }
  };
}