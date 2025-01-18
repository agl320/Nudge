import ReactDOM from "react-dom/client";

import "./index.css";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import NotFound from "./components/ui/NotFound/NotFound";
import App from "./App";

const router = createBrowserRouter([
    { errorElement: <NotFound /> },
    { path: "/", element: <App /> },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
    <RouterProvider router={router} />
);
