import NavBar from "../NavBar/NavBar";
import LoginForm from "./LoginForm";
import { Button } from "../ui/button";
import { Link } from "react-router";
import { Separator } from "../ui/separator";

function Login() {
    return (
        <section className="w-screen min-h-screen h-full w-full px-16 bg-black">
            <NavBar />
            <div className="h-full lg:flex mx-auto max-w-6xl justify-center ">
                {/* Adjusted this section */}
                <div className="lg:w-1/2 h-full bg-white p-8 py-16 my-8 ml-0 mr-4 rounded-md flex flex-col justify-center min-h-[300px] lg:min-h-[700px] text-center text-black">
                    <h1 className="text-4xl font-medium font-display">
                        Nudge.io
                    </h1>
                    <p className="mt-4 max-w-xs mx-auto">
                        Prioritize meeting efficiency by optimizing participant
                        time.
                    </p>
                    <p className="mt-4">[*_*]</p>
                </div>
                <div className="lg:w-1/2 m-8  text-white rounded-md flex flex-col justify-center p-8 py-16 mr-0 my-8 ml-4 min-h-[700px]">
                    <div className="max-w-sm mx-auto">
                        <div className="text-center space-y-4 mb-8">
                            <h2 className="text-2xl font-semibold">
                                Welcome back
                            </h2>
                            <p className="">
                                Get back to doing your work by making the most
                                of your meetings.
                            </p>
                        </div>
                        <LoginForm />
                        <div className="space-y-8 mt-8">
                            <div className="flex justify-center">
                                <div className="flex flex-col justify-center">
                                    <Separator className="bg-white/50 w-[150px]" />
                                </div>

                                <p className="opacity-50 text-xs mx-2">OR</p>
                                <div className="flex flex-col justify-center">
                                    <Separator className="bg-white/50 w-[150px]" />
                                </div>
                            </div>
                            <div className="flex justify-center">
                                <Button className="bg-white text-black">
                                    Log In with Google
                                </Button>
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
    );
}

export default Login;
