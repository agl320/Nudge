import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { useUser } from "@/service/userContext";
import { User } from "@/types/User";

function NavBar({ user }: { user: User | null }) {
    const { UserSignOut } = useUser();

    return (
        <header>
            <div className="flex justify-center w-full ">
                <div className="flex justify-between text-white max-w-6xl w-full py-8">
                    <Link
                        to="/"
                        className="text-5xl font-regular font-wide whitespace-nowrap"
                    >
                        <span className="text-white font-regular font-display">
                            Nudge<span className="text-green-500">*</span>
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
                                {user ? (
                                    <div className="flex gap-x-4">
                                        <Link
                                            to="/meeting"
                                            className="text-black"
                                        >
                                            <Button className="rounded-md bg-white">
                                                Meeting Hub
                                            </Button>
                                        </Link>
                                        <UserSignOut />
                                    </div>
                                ) : (
                                    <Link to="/" className="text-black">
                                        <Button className="rounded-md bg-white">
                                            Login
                                        </Button>
                                    </Link>
                                )}
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
