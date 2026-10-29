import { useCallback, useEffect, useState } from 'react';

export function useAsync(loader) {
  const [result, setResult] = useState(null);
  const [revision, setRevision] = useState(0);

  const reload = useCallback(() => setRevision((value) => value + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    Promise.resolve(loader(controller.signal))
      .then((data) => {
        if (!controller.signal.aborted) setResult({ loader, revision, data, error: null });
      })
      .catch((cause) => {
        if (!controller.signal.aborted) setResult({ loader, revision, data: null, error: cause });
      });
    return () => controller.abort();
  }, [loader, revision]);

  const currentResult = result?.loader === loader && result.revision === revision;
  return {
    data: currentResult ? result.data : null,
    error: currentResult ? result.error : null,
    loading: !currentResult,
    reload,
  };
}
