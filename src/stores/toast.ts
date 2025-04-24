import type { Toast } from "@/types";
import { defineStore } from "pinia";
import { readonly, ref } from "vue";

export const useToast = defineStore("toasts", () => {
  const toasts = ref<Toast[]>([]);

  const addToast = (toast: Omit<Toast, "id">) => {
    const _toast: Toast = {
      id: self.crypto.randomUUID(),
      title: toast.title,
      description: toast.description,
      color: toast.color,
      icon: toast.icon,
      duration: toast.duration,
      showProgress: toast.showProgress,
    };
    toasts.value.push(_toast);
  };

  const removeToast = (id: string) => {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  };

  const clearToasts = () => {
    toasts.value = [];
  };

  return {
    toasts: readonly(toasts),
    addToast,
    removeToast,
    clearToasts,
  };
});
