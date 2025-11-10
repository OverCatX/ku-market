import { Stripe } from 'stripe';
import { Request, Response } from 'express';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

interface Item {
  name: string;
  price: number;
  quantity: number;
}

export class CheckoutController {
  createCheckoutSession = async (req: Request, res: Response): Promise<Response> => {
    try {
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

        const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card', 'promptpay'],
        mode: 'payment',
        line_items,
        success_url: 'http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: 'http://localhost:3000/cancel',
        locale: 'th',
        submit_type: 'pay',
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
}
