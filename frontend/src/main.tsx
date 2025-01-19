import ReactDOM from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import NotFound from "./components/ui/NotFound/NotFound";
import App from "./App";
import { FirebaseProviders } from "./service/firebaseContext";
import Register from "@/components/Register/Register"
import Login from "./components/Login/Login";
import Meeting from "./meeting-page/Meeting";

const router = createBrowserRouter([
  { errorElement: <NotFound /> },
  { path: "/", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/meeting/:meetingID", element: <Meeting /> },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
    <FirebaseProviders>
        <RouterProvider router={router} />
    </FirebaseProviders>
);
