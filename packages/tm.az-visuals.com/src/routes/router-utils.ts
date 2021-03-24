import { useState } from "react";
import { useLocation } from "react-router-dom";

export const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

export const useLocalStorage = (
  key: string,
  defaultValue: string = ""
): [string, (value: string) => void] => {
  const [cache, setCache] = useState<string>(
    localStorage.getItem(key) ?? defaultValue
  );
  return [
    cache,
    (value: string) => {
      localStorage.setItem(key, value);
      setCache(value);
    },
  ];
};
