import { useState, useCallback } from "react";

const API_BASE = "http://localhost:5000";

export function useInfoModal() {
  const [modal, setModal] = useState({
    open: false,
    type: null, // "pest" | "disease"
    name: null,
    data: null,
    loading: false,
    error: null,
  });

  const openModal = useCallback(async (type, name) => {
    setModal({
      open: true,
      type,
      name,
      data: null,
      loading: true,
      error: null,
    });

    try {
      const endpoint =
        type === "pest"
          ? `${API_BASE}/pest-info/${encodeURIComponent(name)}`
          : `${API_BASE}/disease-info/${encodeURIComponent(name)}`;

      const res = await fetch(endpoint);
      if (!res.ok) throw new Error(`Info for "${name}" not found`);
      const data = await res.json();

      setModal((prev) => ({ ...prev, data, loading: false }));
    } catch (err) {
      setModal((prev) => ({ ...prev, loading: false, error: err.message }));
    }
  }, []);

  const closeModal = useCallback(() => {
    setModal({
      open: false,
      type: null,
      name: null,
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  return { modal, openModal, closeModal };
}
