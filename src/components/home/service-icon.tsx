import type { ServiceIcon as ServiceIconName } from "@/content/services";
import { Dumbbell, Runner, Seated, Spine } from "@/components/ui/icons";

const icons = { runner: Runner, spine: Spine, dumbbell: Dumbbell, seated: Seated } as const;

export function ServiceIcon({ name, className = "size-8" }: { name: ServiceIconName; className?: string }) {
  const Cmp = icons[name];
  return <Cmp className={className} />;
}
