import { useTracksToasts } from "@/composables/useTracksToasts";
import { QueryClient, QueryCache, MutationCache } from "@tanstack/vue-query";

const { addErrorToast } = useTracksToasts();

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError(error, query) {
      addErrorToast(error);
    },
  }),
  mutationCache: new MutationCache({
    onError(error, _variables, _ctx, mutation) {
      addErrorToast(error);
    },
  }),
});
