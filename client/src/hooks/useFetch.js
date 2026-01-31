import { useState, useEffect, useCallback, useRef } from "react";
import api from "./api";

const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // store a stable ref for options to avoid changing dependency
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get(url, optionsRef.current);
      setData(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }, [url]); // only url as dependency, options are stable via ref

  useEffect(() => {
    let isMounted = true;

    const run = async () => {
      if (isMounted) {
        await fetchData();
      }
    };

    run();

    return () => {
      isMounted = false;
    };
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    reFetch: fetchData, // can manually re-fetch
  };
};

export default useFetch;
