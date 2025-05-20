import { RouterProvider } from "react-router-dom";
import letstopic from "./Routing/Letstopic";
import { Toaster } from "react-hot-toast";
export default function App() {
  return (
    <>
      <div>
        <RouterProvider router={letstopic} />
        <Toaster />
      </div>
    </>
  );
}
