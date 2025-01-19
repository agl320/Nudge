import ReactDOM from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { MeetingProvider } from "./service/meetingContext";
import NotFound from "./components/ui/NotFound/NotFound";
import { FirebaseProviders } from "./service/firebaseContext";
import Register from "@/components/Login/Register";
import Login from "./components/Login/Login";
import Meeting from "./components/MeetingPage/Meeting";
import MeetingHub from "./components/MeetingPage/MeetingHub";
import { UserProvider } from "./service/userContext";

const router = createBrowserRouter([
    { errorElement: <NotFound /> },
    { path: "/", element: <Login /> },
    { path: "/register", element: <Register /> },
    { path: "/meeting/:meetingID", element: <Meeting /> },
    { path: "/meeting/", element: <MeetingHub /> },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <FirebaseProviders>
    <UserProvider>
      <MeetingProvider>
        <RouterProvider router={router} />
      </MeetingProvider>
    </UserProvider>
  </FirebaseProviders>
);
