import { notFound } from "next/navigation";
import Link from "next/link";
const topics: Record<string, { title: string; body: string }> = {
  about: {
    title: "About Nexus",
    body: "Nexus is a student-built PC peripherals storefront for a one-day system integration presentation. Catalog entries and prices are demonstration data, not a commercial offer.",
  },
  shipping: {
    title: "Shipping and returns",
    body: "Demo orders use a ₱250 shipping fee, waived for orders of ₱5,000 or more. No real goods are dispatched. Administrators can demonstrate processing, shipment references, delivery, and cancellation. Cancelling pending or processing orders restores inventory.",
  },
  warranty: {
    title: "Warranty",
    body: "Warranty descriptions in the sample catalog are for presentation purposes. This project does not sell products or provide real manufacturer warranty services.",
  },
  contact: {
    title: "Contact and support",
    body: "For this school project, contact the project presenter directly. There is no live support team, monitored support mailbox, or physical store locator.",
  },
  faq: {
    title: "Frequently asked questions",
    body: "Create an account, browse products, add items to your cart, and place a COD or simulated electronic-payment order. Your orders appear under My account. No real payment is collected. Only the store administrator can edit products or change order status.",
  },
  privacy: {
    title: "Privacy notice",
    body: "Supabase stores account details, shipping information you enter, orders, and optional reviews or newsletter preferences. Use fictional shipping details for the presentation. Reviews are public; orders are visible only to their owner and administrators. Contact the presenter to remove your test account and records after the demo. Newsletter preferences are stored but no marketing emails are sent.",
  },
  terms: {
    title: "Demo terms",
    body: "This is an educational demonstration, not a real store. No payment is collected, no real orders are fulfilled, and no installment, warranty, delivery, or support service is offered. Use test information rather than sensitive personal details.",
  },
};
export default async function HelpPage({ params }: PageProps<"/help/[topic]">) {
  const { topic } = await params;
  const content = topics[topic];
  if (!content) notFound();
  return (
    <div className="container-nexus max-w-3xl py-12">
      <h1 className="mb-6 font-display text-3xl font-bold">{content.title}</h1>
      <div className="panel p-6">
        <p className="leading-relaxed text-muted">{content.body}</p>
      </div>
      <Link href="/" className="btn btn-primary mt-6">
        Back to store
      </Link>
    </div>
  );
}
