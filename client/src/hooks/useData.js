import { useState, useEffect, useCallback } from "react";
import { fetchData } from "../utils/api";

// Custom hook for fetching data from API
export function useData(endpoint) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    fetchData(endpoint).then(result => {
      setData(result);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, [endpoint]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, refresh: load };
}
