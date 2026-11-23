import { queryOptions } from "@tanstack/react-query";

import { getJobs } from "./jobs.functions";

/** Feed and details share a result without spending another provider request. */
export const jobsQueryOptions = queryOptions({
  queryKey: ["jobs", "live"],
  queryFn: () => getJobs(),
  staleTime: 5 * 60 * 1000,
  refetchOnWindowFocus: false,
});