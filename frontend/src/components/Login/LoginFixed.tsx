import { GoogleSignIn } from "@/service/firebaseContext";
import NavBar from "../NavBar/NavBar";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import LoginForm from "./LoginForm";
import { Link } from "react-router";

function LoginFixed() {
    return (
        <div className="bg-black bg-cover h-full w-screen">
            <section className="flex flex-col flex-1 h-screen min-h-[900px] max-w-6xl mx-auto">
                <NavBar />
                <div className="lg:flex h-full justify-center ">
                    <div className="max-w-1/2 w-full my-8 bg-white/10  lg:mr-4 bg-gradient-to-r from-pastel-pink to-pastel-orange rounded-md flex flex-col justify-center">
                        <section className="space-y-8 p-16 text-center">
                            <h1 className="text-4xl font-medium font-display">
                                Nudge*
                            </h1>
                            <p className="mt-4 max-w-xs mx-auto">
                                Prioritize meeting efficiency by optimizing
                                participant time.
                            </p>
                            <p className="mt-4">[*_*]</p>
                        </section>
                    </div>
                    <div className="max-w-1/2 w-full my-8 lg:ml-4 text-white rounded-md flex flex-col justify-center p-8 py-16">
                        <div className="max-w-sm mx-auto">
                            <div className="text-center space-y-4 mb-8">
                                <h2 className="text-2xl font-semibold">
                                    Welcome back
                                </h2>
                                <p className="">
                                    Get back to collecting drinks from your
                                    favourite menus
                                </p>
                            </div>
                            <LoginForm />
                            <div className="space-y-8 mt-8">
                                <div className="flex justify-center">
                                    <div className="flex flex-col justify-center">
                                        <Separator className="bg-white/50 w-[150px]" />
                                    </div>

                                    <p className="opacity-50 text-xs mx-2">
                                        OR
                                    </p>
                                    <div className="flex flex-col justify-center">
                                        <Separator className="bg-white/50 w-[150px]" />
                                    </div>
                                </div>
                                <div className="flex justify-center">
                                    <GoogleSignIn />
                                </div>
                                <div className="flex justify-center">
                                    <span className="block">
                                        Need an account?{"\t"}
                                        <Link
                                            to="/register"
                                            className="text-pastel-orange font-medium"
                                        >
                                            Register
                                        </Link>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default LoginFixed;
