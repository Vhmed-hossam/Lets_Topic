import toast from "react-hot-toast";

export function SuccesToast(text) {
  return toast.success(text, {
    style: {
      borderRadius: "10px",
      background: "#31A3BD",
      color: "#F8F8FF",
      padding: "10px",
      borderRadius: "50px",
    },
    duration: 3000,
    position: "bottom-right",
    iconTheme: {
      primary: "#F8F8FF",
      secondary: "#31A3BD",
    },
  });
}

export function ErrorToast(text) {
  return toast.error(text, {
    style: {
      borderRadius: "10px",
      background: "#E25E60",
      color: "#F8F8FF",
      padding: "10px",
    },
    duration: 3000,
    position: "bottom-right",
    iconTheme: {
      primary: "#F8F8FF",
      secondary: "#E25E60",
    },
  });
}
