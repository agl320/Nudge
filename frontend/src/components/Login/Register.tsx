import NavBar from "../NavBar/NavBar";
import { Terminal } from "lucide-react";
import { RegisterForm } from "./RegisterForm";

function Register() {
    return (
        <section className="w-screen min-h-screen h-full w-full px-16 bg-black">
            <NavBar user={null} />
            <div className="h-full lg:flex mx-auto max-w-6xl justify-center">
                <div className="lg:w-1/2 h-full bg-white p-8 py-16 my-8 ml-0 mr-4 rounded-md flex flex-col justify-center min-h-[300px] lg:min-h-[700px] text-center text-black">
                    <Terminal className="w-16 h-16 mx-auto mb-6" />
                    <h1 className="text-4xl font-mono font-medium">
                        <span className="text-green-500"> </span>Nudge.io
                    </h1>
                    <p className="mt-4 max-w-xs mx-auto font-mono">
                        <span className="text-green-500">$</span>{" "}
                        initialize_efficiency.sh
                    </p>
                    <div className="mt-8 font-mono text-sm">
                        <p className="text-green-500">
                            {">"} Loading modules...
                        </p>
                        <p className="text-green-500">
                            {">"} Optimizing meetings...
                        </p>
                        <p className="text-green-500">
                            {">"} Ready for deployment
                        </p>
                        <p className="mt-4 text-xs opacity-50 animate-pulse">
                            [System Ready]
                        </p>
                    </div>
                </div>
                <div className="lg:w-1/2 m-8 text-white rounded-md flex flex-col justify-center p-8 py-16 mr-0 my-8 ml-4 min-h-[700px]">
                    <RegisterForm />
                </div>
            </div>
        </section>
    );
}

export default Register;
