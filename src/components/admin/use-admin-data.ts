"use client";

import { useState } from "react";
import { getAdminClient } from "@/lib/booking/client";
import { useAsyncData } from "@/lib/use-async";

/** Loads everything the admin views need; `reload()` refetches after a change. */
export function useAdminData() {
  const [version, setVersion] = useState(0);
  const state = useAsyncData(`admin:${version}`, async () => {
    const client = getAdminClient();
    const [appointments, services, practitioners, exceptions, serviceAreas] = await Promise.all([
      client.listAppointments(),
      client.listServices(),
      client.listPractitioners(),
      client.listExceptions(),
      client.listServiceAreas(),
    ]);
    return { appointments, services, practitioners, exceptions, serviceAreas };
  }, { keepPrevious: true });

  return {
    data: state.data,
    initialLoading: state.loading && !state.data,
    refreshing: state.loading && Boolean(state.data),
    error: state.error,
    retry: state.retry,
    reload: () => setVersion((v) => v + 1),
  };
}

export type AdminData = NonNullable<ReturnType<typeof useAdminData>["data"]>;
