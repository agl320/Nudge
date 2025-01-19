import { useUser } from "reactfire";
import NavBar from "../NavBar/NavBar";
import { useNavigate } from "react-router";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Link, PhoneIncoming } from "lucide-react";
import { useState } from "react";

function MeetingHub() {
    const { status, data: user } = useUser();
    const navigate = useNavigate();

    const [meetingID, setMeetingID] = useState<string>("");

    if (status === "loading") {
        return <span>Loading...</span>;
    }

    if (!user) {
        navigate("/");
    }

    const handleJoinMeeting = () => {
        navigate(`/meeting/${meetingID}`);
    };

    return (
        <div className="bg-black bg-cover h-full w-screen">
            <section className="flex flex-col flex-1 h-screen min-h-[900px] max-w-6xl mx-auto ">
                <NavBar user={user} />

                <div className="mt-32 h-full space-y-8">
                    <h1 className="text-4xl font-medium">Meeting Hub</h1>
                    <div className="">
                        <p className="text-white block rounded-md">
                            <span className="text-green-400">$ user-uid </span>
                            {user?.uid}
                        </p>
                        <p className="text-white block rounded-md">
                            <span className="text-green-400">
                                $ user-displayName{" "}
                            </span>
                            {user?.displayName}
                        </p>
                    </div>
                    <div className="space-y-4">
                        <h2>Enter Meeting ID</h2>
                        <div className="flex">
                            <Input
                                className="max-w-64"
                                maxLength={28}
                                value={meetingID}
                                onChange={(e) => setMeetingID(e.target.value)}
                            />
                            <Button
                                className="bg-green-500 text-black ml-4 flex items-center gap-2"
                                onClick={handleJoinMeeting}
                            >
                                Join Meeting <PhoneIncoming />
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default MeetingHub;
