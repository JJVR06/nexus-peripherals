import type { OrderStatus } from "@/lib/types";

const STYLES: Record<OrderStatus, string> = {
  pending: "border-warning/40 bg-warning/10 text-warning",
  processing: "border-primary/40 bg-primary/10 text-primary",
  shipped: "border-accent/40 bg-accent/10 text-accent",
  delivered: "border-success/40 bg-success/10 text-success",
  cancelled: "border-danger/40 bg-danger/10 text-danger",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`chip capitalize ${STYLES[status]}`}>{status}</span>
  );
}
