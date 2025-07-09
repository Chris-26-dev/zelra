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
