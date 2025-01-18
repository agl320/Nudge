import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";

function NavBar() {
    return (
        <header>
            <div className="flex justify-center w-full bg-white bg-opacity-[2%]">
                <div className="flex justify-between text-white max-w-6xl w-full py-8">
                    <Link
                        to="/"
                        className="text-5xl font-regular font-wide whitespace-nowrap"
                    >
                        <span className="text-white font-regular font-display">
                            Nudge.
                        </span>
                    </Link>
                    <div className=" gap-x-12 w-full flex-grow flex items-center w-auto text-center">
                        <ul className="flex-1 justify-end items-center text-center flex">
                            <li className="">
                                <Link
                                    className="px-6 py-2 hover:bg-white/15 rounded-md duration-100"
                                    to="/"
                                >
                                    Home
                                </Link>
                            </li>
                            <li className="mr-6">
                                <Link
                                    className="px-6 py-2 hover:bg-white/15 rounded-md duration-100"
                                    to="/"
                                >
                                    About Us
                                </Link>
                            </li>

                            <li>
                                <Button className="rounded-md bg-white">
                                    <Link to="/app" className="text-black">
                                        Log In
                                    </Link>
                                </Button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <Separator className="w-full bg-custom h-[1px]" />
        </header>
    );
}

export default NavBar;
