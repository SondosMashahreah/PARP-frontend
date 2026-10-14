import { useCallback, useEffect, useRef, useState } from "react";
export function useAdminResource(loader, revision = 0) {
  const [state, setState] = useState({ data: null, loading: true, error: "" });
  const [request, setRequest] = useState(0);
  const generation = useRef(0);
  const reload = useCallback(() => setRequest((value) => value + 1), []);
  useEffect(() => {
    const current = ++generation.current;
    let active = true;
    Promise.resolve()
      .then(() => {
        if (active) setState((old) => ({ ...old, loading: true, error: "" }));
        return loader();
      })
      .then((data) => {
        if (active && current === generation.current)
          setState({ data, loading: false, error: "" });
      })
      .catch((error) => {
        if (active && current === generation.current)
          setState((old) => ({
            ...old,
            loading: false,
            error: error.message || "Request failed",
          }));
      });
    return () => {
      active = false;
    };
  }, [loader, revision, request]);
  return { ...state, reload };
}
