import { useEffect, useState } from "react";

import { fetchSuggestion, type SuggestInput } from "@/lib/aiSuggestion";

/**
 * Fetches an AI suggestion, falling back to static copy until (or unless) the
 * Edge Function returns one. Refetches when `depKey` changes — pass a key built
 * from the meaningful inputs (e.g. context + calorie/protein totals) so a new
 * tip is fetched when the day's data changes, not on every render.
 */
export function useAISuggestion(
  input: SuggestInput,
  fallback: string,
  depKey: string,
) {
  const [tip, setTip] = useState(fallback);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchSuggestion(input)
      .then((s) => {
        if (active && s) setTip(s);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depKey]);

  return { tip, loading };
}
