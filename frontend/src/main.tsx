import ReactDOM from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import NotFound from "./components/ui/NotFound/NotFound";
import App from "./App";
import { FirebaseProviders } from "./service/firebaseContext";

const router = createBrowserRouter([
    { errorElement: <NotFound /> },
    { path: "/", element: <App /> },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <FirebaseProviders>
    <RouterProvider router={router} />
  </FirebaseProviders>
);
