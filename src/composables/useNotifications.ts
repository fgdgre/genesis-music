import { useToast } from "@/stores/toast";

export const useNotification = () => {
  const toastsStore = useToast();

  const setErrorToast = (error: { status: number; message: string }) => {
    if (error.status === 409) {
      toastsStore.addToast({
        title: error.message,
        description: "Edit or delete, because his will not save",
        color: "red",
        icon: "warning",
      });
    } else {
      toastsStore.addToast({
        title: "Something went wrong",
        description: error.message,
        color: "red",
        icon: "warning",
      });
    }
  };
  const setSuccessToast = (action: "create" | "delete" | "edit") => {
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

  return { setErrorToast, setSuccessToast };
};
