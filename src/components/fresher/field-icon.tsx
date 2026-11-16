import { Code2, Cog, Landmark, Megaphone, Palette, TrendingUp, Users, type LucideIcon } from "lucide-react";

import type { Field } from "@/lib/jobs/types";

export const FIELD_ICONS: Record<Field, LucideIcon> = {
  "Tech/IT": Code2,
  Marketing: Megaphone,
  Finance: Landmark,
  "Core Engineering": Cog,
  "HR/Operations": Users,
  "Creative/Design": Palette,
  Sales: TrendingUp,
};
