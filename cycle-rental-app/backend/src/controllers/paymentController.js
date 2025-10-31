import Stripe from "stripe";
import prisma from "../prisma.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Create Stripe checkout session for unpaid rides
 */
export const createCheckoutSession = async (req, res) => {
  try {
    const { student_id } = req.body;

    // ✅ Fetch unpaid payments via related RentalSession
    const unpaidPayments = await prisma.payment.findMany({
      where: {
        session: {
          student_id: student_id,
        },
        status: "PENDING",
      },
      include: { session: true },
    });

    if (unpaidPayments.length === 0) {
      return res.status(400).json({ message: "No pending payments!" });
    }

    // ✅ Calculate total due
    const totalAmount = unpaidPayments.reduce(
      (sum, p) => sum + Number(p.amount),
      0
    );

    // ✅ Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: "Cycle Rental Ride Payments",
              description: `${unpaidPayments.length} unpaid rides`,
            },
            unit_amount: Math.round(totalAmount * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL_USER}/payment-success`,
      cancel_url: `${process.env.FRONTEND_URL_USER}/payment-cancel`,
      metadata: { student_id },
    });

    res.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error("❌ Error creating checkout session:", error);
    res.status(500).json({ message: "Stripe session error", error });
  }
};

/**
 * Webhook - Stripe calls this after payment success
 */
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const studentId = session.metadata.student_id;

      // ✅ Update all unpaid payments for this student's sessions
      await prisma.payment.updateMany({
        where: {
          session: {
            student_id: studentId,
          },
          status: "PENDING",
        },
        data: { status: "PAID" },
      });
    }

    res.json({ received: true });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
};
