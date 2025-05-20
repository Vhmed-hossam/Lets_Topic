import { createBrowserRouter } from "react-router-dom";
import Layout from "../Layout/layout";


const letstopic = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
    
    ],
  },
]);

export default letstopic;
