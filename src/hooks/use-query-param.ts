'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export const useQueryParam = (key: string) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const value = searchParams.get(key);

  const setValue = (newValue: string | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (newValue === null) {
      params.delete(key);
    } else {
      params.set(key, newValue);
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return [value, setValue] as const;
};

// ✅ New: hook to set multiple query params at once (used in usePanel)
export const useSetQueryParams = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };
};
