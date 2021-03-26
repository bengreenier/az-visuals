import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { RuntimeManifest } from "../types";

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

export const useRuntimeManifest = () => {
  const [manifest, setManifest] = useState<RuntimeManifest>();

  useEffect(() => {
    fetch("/runtime-manifest.json").then(async (res) => {
      const data = (await res.json()) as RuntimeManifest;
      setManifest(data);
    });
  }, []);

  return manifest;
};
