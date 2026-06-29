import { createFileRoute } from "@tanstack/react-router";
import { OrdersIndex } from "./orders";

export const Route = createFileRoute("/orders/")({
  component: OrdersIndex,
});