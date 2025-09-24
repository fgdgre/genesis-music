import { ref, readonly } from "vue";
// TODO: invalidate after some time
export const createQueryCache = () => {
  const values = ref<Record<string, any>>({});

  return {
    values: readonly(values),
    setQuery: (queryKey: string, data: any) => {
      values.value[queryKey] = data;
    },
    invalidateQuery: (
      queryParam: string | ((queryKey: string, data: any) => boolean),
    ) => {
      values.value.delete(queryParam);
    },
    invalidateAll: (queryKey?: string) => {
      if (queryKey) {
        values.value = Object.fromEntries(
          Object.entries(values.value).filter(
            ([_queryKey, _]) => !_queryKey.includes(queryKey),
          ),
        );
      } else {
        values.value = {};
      }
    },
  };
};
