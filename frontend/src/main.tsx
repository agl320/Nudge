import { Routes, Route } from "react-router-dom";
import NotFound from "./components/ui/NotFound/NotFound";

function Home() {
    return <h1>Welcome to the Home Page</h1>;
}

function About() {
    return <h1>About Us</h1>;
}

function Contact() {
    return <h1>Contact Us</h1>;
}

export default function App() {
    return (
        <div>
            <h1>My React Router App</h1>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </div>
    );
}
