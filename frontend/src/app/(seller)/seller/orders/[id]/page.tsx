"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function OrderRedirectPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  useEffect(() => {
    if (id) router.replace(`/seller/orders/${id}/label`);
  }, [id, router]);

  return null;
}
