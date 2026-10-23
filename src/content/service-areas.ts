/**
 * Home visit service areas.
 *
 * FICTIONAL DEMO DATA: suburb names and postcodes are invented for the
 * prototype. Replace with the client's real service area list.
 */
import type { ServiceArea } from "@/lib/booking/types";

export interface ServiceZone {
  id: string;
  name: string;
  description: string;
  travelBufferMin: number;
}

export const serviceZones: ServiceZone[] = [
  {
    id: "zone-inner",
    name: "Inner zone",
    description: "Suburbs close to our base. Most availability.",
    travelBufferMin: 15,
  },
  {
    id: "zone-middle",
    name: "Middle zone",
    description: "A short drive from our base.",
    travelBufferMin: 30,
  },
  {
    id: "zone-outer",
    name: "Outer zone",
    description: "Selected days only, subject to availability.",
    travelBufferMin: 45,
  },
];

const zoneBuffer = (zone: string) =>
  serviceZones.find((z) => z.id === zone)?.travelBufferMin ?? 30;

const area = (id: string, suburb: string, postcode: string, zone: string): ServiceArea => ({
  id,
  suburb,
  postcode,
  zone,
  travelBufferMin: zoneBuffer(zone),
});

export const serviceAreas: ServiceArea[] = [
  area("area-01", "Koa Bay", "9101", "zone-inner"),
  area("area-02", "Wattle Rise", "9102", "zone-inner"),
  area("area-03", "Riverbend", "9103", "zone-inner"),
  area("area-04", "Banksia Park", "9104", "zone-inner"),
  area("area-05", "Harbour Heights", "9110", "zone-middle"),
  area("area-06", "Greenvale East", "9111", "zone-middle"),
  area("area-07", "Saltwater Point", "9112", "zone-middle"),
  area("area-08", "Ironbark Hill", "9113", "zone-middle"),
  area("area-09", "Coral Creek", "9120", "zone-outer"),
  area("area-10", "Stonefield", "9121", "zone-outer"),
];
