import { useUser } from "reactfire";
import NavBar from "../NavBar/NavBar";
import { useNavigate } from "react-router";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Link, PhoneIncoming, UserRoundPlus } from "lucide-react";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../ui/dialog";
import CreateMeetingDialog from "./CreateMeetingDialog";

function MeetingHub() {
    const { status, data: user } = useUser();
    const navigate = useNavigate();

    const [joinMeetingID, setJoinMeetingID] = useState<string>("");
    const [createMeetingID, setCreateMeetingID] = useState<string>("");

    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleDialogClose = () => {
        setIsDialogOpen(false); // Reset dialog visibility state
    };

    const handleDialogOpen = () => {
        setIsDialogOpen(true); // Open the dialog
    };

    if (status === "loading") {
        return <span>Loading...</span>;
    }

    if (!user) {
        navigate("/");
        return null; // Prevent further rendering
    }

    const handleJoinMeeting = () => {
        if (joinMeetingID.trim() === "") {
            alert("Please enter a valid Meeting ID to join.");
            return;
        }
        navigate(`/meeting/${joinMeetingID}`);
    };

    return (
        <div className="bg-black bg-cover h-full w-screen">
            <section className="flex flex-col flex-1 min-h-screen min-h-[900px] max-w-6xl mx-auto">
                <NavBar user={user} />

                <div className="bg-fade-right mt-16 py-16 px-16 rounded-md h-full space-y-16">
                    <div className="space-y-16">
                        <div className="space-y-8">
                            <h1 className="text-4xl font-medium font-display">
                                Meeting Hub
                            </h1>
                            <div className="">
                                <p className="text-white block rounded-md">
                                    <span className="text-green-500 bg-green-500/15 px-2 py-1 rounded-md text-sm mr-4">
                                        $ user-uid{" "}
                                    </span>
                                    {user?.uid}
                                </p>
                                <p className="text-white block rounded-md mt-4">
                                    <span className="text-green-500 bg-green-500/15 px-2 py-1 rounded-md text-sm mr-4">
                                        $ user-displayName{" "}
                                    </span>
                                    {user?.displayName}
                                </p>
                            </div>
                        </div>

                        {/* Create Meeting Section */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-medium">
                                Create a meeting
                            </h2>
                            <div className="flex">
                                {/* <Input
                                    className="max-w-64"
                                    maxLength={28}
                                    placeholder="Enter Meeting ID"
                                    value={createMeetingID}
                                    onChange={(e) =>
                                        setCreateMeetingID(e.target.value)
                                    }
                                /> */}
                                <Button
                                    className="bg-green-500 text-white px-4 py-2 rounded"
                                    onClick={handleDialogOpen}
                                >
                                    Create New Meeting <UserRoundPlus />
                                </Button>
                                {isDialogOpen && (
                                    <CreateMeetingDialog
                                        isOpen={isDialogOpen}
                                        onClose={handleDialogClose}
                                    />
                                )}
                                {/* <Dialog>
                                    <DialogTrigger>
                                        <Button
                                            className="bg-green-500 text-black flex items-center gap-2"
                                            // onClick={handleCreateMeeting}
                                        >
                                            Create Meeting <Link />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>
                                                Create a Meeting
                                            </DialogTitle>
                                            <DialogDescription>
                                                This action cannot be undone.
                                                This will permanently delete
                                                your account and remove your
                                                data from our servers.
                                            </DialogDescription>
                                        </DialogHeader>
                                    </DialogContent>
                                </Dialog> */}
                            </div>
                        </div>
                    </div>

                    {/* Join Meeting Section */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-medium">
                            Meeting already started? Join a meeting below
                        </h2>
                        <div className="flex">
                            <Input
                                className="max-w-64"
                                maxLength={28}
                                placeholder="Enter Meeting ID"
                                value={joinMeetingID}
                                onChange={(e) =>
                                    setJoinMeetingID(e.target.value)
                                }
                            />
                            <Button
                                className="bg-white text-black ml-4 flex items-center gap-2"
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
