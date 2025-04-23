import { useToast } from "@/stores/toast";

export const useTracksToasts = () => {
  const toastsStore = useToast();

  const addErrorToast = (error: { status: number; message: string }) => {
    toastsStore.clearToasts();

    let message: string;

    switch (error.status) {
      case 409:
        message = "Edit or delete, because his will not save";
        break;
      default:
        message = "Something went wrong";
        break;
    }

    toastsStore.addToast({
      title: error.message,
      description: message,
      color: "red",
      icon: "warning",
    });
  };

  const addSuccessToast = (action: "create" | "delete" | "edit") => {
    toastsStore.clearToasts();

    let title: string;

    switch (action) {
      case "create":
        title = "Track successfully created";
        break;
      case "edit":
        title = "Track successfully edited";
        break;
      case "delete":
        title = "Track successfully deleted";
        break;
      default:
        title = "Success";
        break;
    }

    toastsStore.addToast({
      title,
      color: "green",
      icon: "check",
      duration: 1500,
      showProgress: true,
    });
  };

  return { addErrorToast, addSuccessToast };
};
