import NavBar from "../NavBar/NavBar";
import { Button } from "../ui/button";
import LoginForm from "./LoginForm";
import { Link } from "react-router";
import { useUser } from "reactfire";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { RegisterForm } from "./RegisterForm";

function Login() {
    const { status, data: user } = useUser();

    const [isOnRegister, setIsOnRegister] = useState(false);

    if (status === "loading") {
        return <span>Loading...</span>;
    }

    if (user) {
        return (
            <div className="bg-black bg-cover h-full w-screen">
                <section className="flex flex-col flex-1 h-screen min-h-[900px] max-w-6xl mx-auto">
                    <NavBar user={user} />

                    <div className="text-center mt-32 justify-center h-full">
                        <div className="space-y-8">
                            <p className="py-2 px-4 bg-white/15 text-white/50 inline-block rounded-md text-xs">
                                $ Logged in as user: {user.uid}
                            </p>

                            <h1 className="text-4xl font-medium">
                                Welcome back, {user.displayName}!
                            </h1>

                            <Link
                                to="/meeting"
                                className="block flex justify-center"
                            >
                                <Button className="bg-white text-black flex items-center gap-2">
                                    Access Meeting Hub <Sparkles />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        );
    }

    return (
        <div className="bg-black bg-cover h-full w-screen px-8">
            <section className="flex flex-col flex-1 min-h-screen min-h-[900px] max-w-6xl mx-auto">
                <NavBar user={user} />
                <div className="lg:flex h-full justify-center">
                    <div className="max-w-1/2 w-full my-8 bg-fade-bg lg:mr-4 rounded-md flex flex-col justify-center">
                        <section className="space-y-8 p-16 text-center">
                            <h1 className="text-4xl font-medium font-display">
                                Nudge<span className="text-green-400">*</span>
                            </h1>
                            <p className="mt-4 max-w-xs mx-auto">
                                Prioritize meeting efficiency by optimizing
                                participant time.
                            </p>
                            <div className="text-sm bg-fade inline-block p-4 rounded-md">
                                <p className="mt-4 text-white/50">
                                    <span className="text-green-400/50">
                                        {">"}
                                    </span>{" "}
                                    Loading modules...
                                </p>
                                <p className="mt-4 text-white/70">
                                    <span className="text-green-400/70">
                                        {">"}
                                    </span>{" "}
                                    Optimizing meetings...
                                </p>
                                <p className="mt-4">
                                    <span className="text-green-400">
                                        {">"}
                                    </span>{" "}
                                    Cleaning up convos...
                                </p>
                                <p className="mt-4 text-green-400 font-bold">
                                    [ *_* ]
                                </p>
                            </div>
                        </section>
                    </div>
                    <div className="max-w-1/2 w-full my-8 lg:ml-4 text-white rounded-md flex flex-col justify-center p-8 py-16">
                        <div className="max-w-md mx-auto">
                            {" "}
                            {isOnRegister && (
                                <RegisterForm
                                    setIsOnRegister={setIsOnRegister}
                                />
                            )}
                            {!isOnRegister && (
                                <LoginForm setIsOnRegister={setIsOnRegister} />
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Login;
