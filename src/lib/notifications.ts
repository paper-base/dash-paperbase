import api from "@/lib/api";
import type {
  Order,
  Cart,
  WishlistItem,
  SupportTicket,
  PaginatedResponse,
} from "@/types";

export type NotificationType =
  | "new_order"
  | "added_to_cart"
  | "added_to_wishlist"
  | "support_ticket";

export interface DashboardNotification {
  /** Unique identifier for this specific notification row */
  id: string;
  /** Underlying resource ID (e.g. order ID) as string */
  resourceId: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

export function getNotificationLink(notification: DashboardNotification): string {
  switch (notification.type) {
    case "new_order":
      return `/orders/${notification.resourceId}`;
    case "added_to_cart":
      return "/carts";
    case "added_to_wishlist":
      return "/wishlist";
    case "support_ticket":
      return "/support-tickets";
    default:
      return "/";
  }
}

export async function fetchNotifications(): Promise<DashboardNotification[]> {
  let ordersRes: { data: unknown };
  let cartRes: { data: unknown };
  let wishlistRes: { data: unknown };
  let supportTicketsRes: { data: unknown };

  try {
    [ordersRes, cartRes, wishlistRes, supportTicketsRes] = await Promise.all([
      api.get<PaginatedResponse<Order>>("admin/orders/"),
      api.get<Cart | PaginatedResponse<Cart>>("admin/carts/"),
      api.get<PaginatedResponse<WishlistItem>>("admin/wishlist/"),
      api.get<PaginatedResponse<SupportTicket>>("admin/support-tickets/"),
    ]);
  } catch {
    // 401/403 when unauthenticated or non-staff; return empty array
    return [];
  }

  const notifications: DashboardNotification[] = [];

  const orders = Array.isArray((ordersRes.data as any).results)
    ? (ordersRes.data as PaginatedResponse<Order>).results
    : (ordersRes.data as any as Order[]);
  for (const order of orders) {
    notifications.push({
      id: `order-${order.public_id}`,
      resourceId: order.public_id,
      type: "new_order",
      title: "New order placed",
      message: `Order #${order.order_number} from ${order.shipping_name}`,
      createdAt: order.created_at,
      isRead: false,
    });
  }

  const cartData = cartRes.data as any;
  const carts: Cart[] = Array.isArray(cartData.results) ? cartData.results : [cartData].filter(
    Boolean
  );
  for (const cart of carts) {
    for (const item of cart.items) {
      notifications.push({
        id: `cart-${item.public_id}`,
        resourceId: item.public_id,
        type: "added_to_cart",
        title: "Product added to cart",
        message: item.product_name,
        createdAt: item.created_at,
        isRead: false,
      });
    }
  }

  const wishlistItems = (wishlistRes.data as PaginatedResponse<WishlistItem>).results ?? [];
  for (const item of wishlistItems) {
    notifications.push({
      id: `wishlist-${item.public_id}`,
      resourceId: item.public_id,
      type: "added_to_wishlist",
      title: "Product added to wishlist",
      message: item.product_name,
      createdAt: item.created_at,
      isRead: false,
    });
  }

  const tickets = (supportTicketsRes.data as PaginatedResponse<SupportTicket>).results ?? [];
  for (const ticket of tickets) {
    notifications.push({
      id: `support-ticket-${ticket.public_id}`,
      resourceId: ticket.public_id,
      type: "support_ticket",
      title: "New support ticket",
      message: `${ticket.name} (${ticket.phone || ticket.email})`,
      createdAt: ticket.created_at,
      isRead: false,
    });
  }

  return notifications.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function markAllAsReadOnClient(
  notifications: DashboardNotification[]
): DashboardNotification[] {
  return notifications.map((n) => ({ ...n, isRead: true }));
}
