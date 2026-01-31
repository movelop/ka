import { useState, useEffect, useContext } from "react";
import api from "./api";
import { AuthContext } from "../context/AuthContextProvider";

const useFetch = (url) => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(url, {
        headers: {
          token: `Bearer ${user?.token}`,
        },
      });
      setData(res.data);
    } catch (err) {
      setError(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user?.token) {
      fetchData();
    }
  }, [url, user?.token]);

  const reFetch = () => fetchData();

  return { data, loading, error, reFetch };
};

export default useFetch;
