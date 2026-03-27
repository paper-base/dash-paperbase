"use client";

import {
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
  type FormEvent,
} from "react";
import { useRouter } from "@/i18n/navigation";
import api from "@/lib/api";
import { useExtraFieldsSchema } from "@/hooks/useExtraFieldsSchema";
import type { ExtraFieldValues } from "@/types/extra-fields";
import type {
  Product,
  PaginatedResponse,
  ProductVariant,
  ShippingMethod,
  ShippingZone,
} from "@/types";
import {
  orderCreateSchema,
  parseValidation,
  validateRequiredExtraFields,
} from "@/lib/validation";

export interface OrderItemRow {
  key: number;
  product_id: string;
  product_name: string;
  product_image: string | null;
  variant_public_id: string | null;
  quantity: number;
  price: string;
}

export interface OrderForm {
  shipping_name: string;
  phone: string;
  email: string;
  shipping_address: string;
  district: string;
  tracking_number: string;
  shipping_zone: string;
  shipping_method: string;
  coupon_code: string;
}

export function useNewOrder() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState<OrderForm>({
    shipping_name: "",
    phone: "",
    email: "",
    shipping_address: "",
    district: "",
    tracking_number: "",
    shipping_zone: "",
    shipping_method: "",
    coupon_code: "",
  });

  const [extraFields, setExtraFieldsState] = useState<ExtraFieldValues>({});
  const setExtraFields = useCallback(
    (value: ExtraFieldValues | ((prev: ExtraFieldValues) => ExtraFieldValues)) => {
      setFieldErrors({});
      setExtraFieldsState(value);
    },
    [],
  );
  const [extraFieldsErrors, setExtraFieldsErrors] = useState<Record<string, string>>({});
  const { schema: extraFieldsSchema } = useExtraFieldsSchema("order");

  const [items, setItems] = useState<OrderItemRow[]>([]);
  const nextKey = useRef(0);

  // Product search
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Variant cache
  const [variantsByProductId, setVariantsByProductId] = useState<Record<string, ProductVariant[]>>({});
  const [variantsLoadingByProductId, setVariantsLoadingByProductId] = useState<Record<string, boolean>>({});

  // Shipping data
  const [shippingZones, setShippingZones] = useState<ShippingZone[]>([]);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [couponPreview, setCouponPreview] = useState<{
    code: string;
    discount_amount: string;
    subtotal_after_discount: string;
  } | null>(null);
  const [couponError, setCouponError] = useState("");

  useEffect(() => {
    Promise.all([
      api.get<PaginatedResponse<ShippingZone> | ShippingZone[]>("admin/shipping-zones/"),
      api.get<PaginatedResponse<ShippingMethod> | ShippingMethod[]>("admin/shipping-methods/"),
    ])
      .then(([z, m]) => {
        setShippingZones(Array.isArray(z.data) ? z.data : (z.data.results ?? []));
        setShippingMethods(Array.isArray(m.data) ? m.data : (m.data.results ?? []));
      })
      .catch(() => {
        setShippingZones([]);
        setShippingMethods([]);
      });
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSearch(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const { data } = await api.get<PaginatedResponse<Product>>("admin/products/", {
          params: { search: value.trim(), status: "active" },
        });
        setResults(data.results);
        setShowResults(true);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  }

  async function ensureVariantsLoaded(productId: string) {
    if (!productId) return;
    if (variantsByProductId[productId]) return;
    setVariantsLoadingByProductId((p) => ({ ...p, [productId]: true }));
    try {
      const { data } = await api.get<PaginatedResponse<ProductVariant> | ProductVariant[]>(
        "admin/product-variants/",
        { params: { product: productId } }
      );
      const list = Array.isArray(data) ? data : data.results;
      setVariantsByProductId((p) => ({ ...p, [productId]: list ?? [] }));
    } catch {
      setVariantsByProductId((p) => ({ ...p, [productId]: [] }));
    } finally {
      setVariantsLoadingByProductId((p) => ({ ...p, [productId]: false }));
    }
  }

  function addProduct(product: Product) {
    if (!product?.public_id) return;
    setFieldErrors({});
    ensureVariantsLoaded(product.public_id);
    setItems((prev) => [
      ...prev,
      {
        key: nextKey.current++,
        product_id: product.public_id,
        product_name: product.name || "Unavailable",
        product_image: product.image_url ?? product.image,
        variant_public_id: null,
        quantity: 1,
        price: product.price,
      },
    ]);
    setQuery("");
    setResults([]);
    setShowResults(false);
  }

  function updateItem<K extends keyof OrderItemRow>(
    key: number,
    field: K,
    value: OrderItemRow[K]
  ) {
    setFieldErrors({});
    setItems((prev) =>
      prev.map((item) => (item.key === key ? { ...item, [field]: value } : item))
    );
  }

  function removeItem(key: number) {
    setFieldErrors({});
    setItems((prev) => prev.filter((item) => item.key !== key));
  }

  function updateForm(patch: Partial<OrderForm>) {
    setFieldErrors({});
    setForm((prev) => ({ ...prev, ...patch }));
  }

  const total = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.price || 0) * item.quantity, 0),
    [items]
  );

  const discountAmount = Number(couponPreview?.discount_amount || 0);
  const totalAfterDiscount = Math.max(0, total - discountAmount);

  async function applyCouponPreview() {
    const code = form.coupon_code.trim();
    if (!code) {
      setCouponPreview(null);
      setCouponError("");
      return;
    }
    try {
      const { data } = await api.post<{
        code: string;
        discount_amount: string;
        subtotal_after_discount: string;
      }>("admin/coupons/apply/", { code, subtotal: total.toFixed(2) });
      setCouponPreview(data);
      setCouponError("");
    } catch {
      setCouponPreview(null);
      setCouponError("Invalid or unavailable coupon for current subtotal.");
    }
  }

  const schemaWithNames = useMemo(
    () => extraFieldsSchema.filter((f) => f.name.trim()),
    [extraFieldsSchema]
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validation = parseValidation(orderCreateSchema, { ...form, items });
    if (!validation.success) {
      setFieldErrors(validation.errors);
      const firstMessage =
        Object.values(validation.errors)[0] ?? "Please correct the highlighted fields.";
      setError(firstMessage);
      return;
    }

    const extraErrors = validateRequiredExtraFields(schemaWithNames, extraFields);
    if (Object.keys(extraErrors).length > 0) {
      setExtraFieldsErrors(extraErrors);
      setFieldErrors({});
      setError("Please fill in all required extra fields.");
      return;
    }
    setExtraFieldsErrors({});
    setFieldErrors({});
    setSaving(true);
    setError("");

    try {
      const payload = {
        ...form,
        shipping_method: form.shipping_method || null,
        coupon_code: form.coupon_code || "",
        items: items.map((item) => ({
          product: item.product_id,
          variant_public_id: item.variant_public_id,
          quantity: item.quantity,
          price: item.price,
        })),
        ...(Object.keys(extraFields).length > 0 && { extra_data: extraFields }),
      };
      await api.post("admin/orders/", payload);
      router.push("/orders");
    } catch {
      setError("Failed to create order. Please check the details and try again.");
    } finally {
      setSaving(false);
    }
  }

  return {
    saving,
    error,
    fieldErrors,
    form,
    updateForm,
    extraFields,
    setExtraFields,
    extraFieldsErrors,
    extraFieldsSchema,
    items,
    query,
    results,
    searching,
    showResults,
    setShowResults,
    searchRef,
    variantsByProductId,
    variantsLoadingByProductId,
    shippingZones,
    shippingMethods,
    total,
    discountAmount,
    totalAfterDiscount,
    couponPreview,
    couponError,
    applyCouponPreview,
    handleSearch,
    addProduct,
    updateItem,
    removeItem,
    ensureVariantsLoaded,
    handleSubmit,
    router,
  };
}
