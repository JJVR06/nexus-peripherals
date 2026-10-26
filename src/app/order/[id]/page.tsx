import { Suspense } from "react";
import { OrderView } from "@/components/order/OrderView";

export const metadata = { title: "Order details" };

export default async function OrderPage({
  params,
}: PageProps<"/order/[id]">) {
  const { id } = await params;
  return (
    <Suspense fallback={<div className="container-nexus py-24 text-center text-muted">Loading order…</div>}>
      <OrderView id={id} />
    </Suspense>
  );
}
