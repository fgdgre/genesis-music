import { useToast } from "@/stores/toast";

export const useTracksToasts = () => {
  const toastsStore = useToast();

  const addErrorToast = (error: { status?: number; message?: string }) => {
    toastsStore.clearToasts();

    let message: string;

    switch (error?.status) {
      case 500:
        message = "Server error, try again";
        break;
      default:
        message = "Something went wrong";
        break;
    }

    toastsStore.addToast({
      title: error?.message || "Error",
      description: message,
      color: "red",
      icon: "warning",
    });
  };

  const addSuccessToast = (
    action: "create" | "delete" | "edit" | "uploadFile" | "deleteFile",
  ) => {
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
      case "uploadFile":
        title = "Track file successfully added";
        break;
      case "deleteFile":
        title = "Track file successfully deleted";
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

  const clearToasts = () => {
    useToast().clearToasts();
  };

  return { addErrorToast, addSuccessToast, clearToasts };
};
