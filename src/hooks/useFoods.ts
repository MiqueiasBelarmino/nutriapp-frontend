import api from "@/lib/api";
import { useState, useCallback } from "react";

export const useFoods = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchFoods = useCallback(async (query: string) => {
    if (!query) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const res = await api.get(`/foods?search=${query}`);
      setResults(res.data);
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, searchFoods, loading };
};
