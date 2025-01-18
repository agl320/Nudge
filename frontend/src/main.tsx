import ReactDOM from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import NotFound from "./components/ui/NotFound/NotFound";
import App from "./App";
import { FirebaseProviders } from "./service/firebaseContext";
import Login from "./components/Login/Login";

const router = createBrowserRouter([
    { errorElement: <NotFound /> },
    { path: "/", element: <Login /> },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
    <FirebaseProviders>
        <RouterProvider router={router} />
    </FirebaseProviders>
);
