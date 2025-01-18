import ReactDOM from "react-dom/client";

import "./index.css";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import NotFound from "./components/ui/NotFound/NotFound";
import App from "./App";
import Meeting from "./meeting-page/Meeting";

const router = createBrowserRouter([
    { errorElement: <NotFound /> },
    { path: "/", element: <App /> },
    { path: "/meeting/:id", element: <Meeting /> },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
    <RouterProvider router={router} />
);
