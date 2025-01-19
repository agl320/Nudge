import { useState } from "react";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { PlusCircle, Trash2 } from "lucide-react";
import ActivityDialog from "./ActivityDialog";

interface IActivity {
    duration: number;
    description: string;
    title: string;
}

interface IMeetingCreation {
    role: string;
    setting: string;
    id: string;
    activities: IActivity[];
}

export default function CreateMeetingDialog({
    isOpen,
    onClose,
}: {
    isOpen: boolean;
    onClose: () => void;
}) {
    const initialMeetingState: IMeetingCreation = {
        role: "",
        setting: "",
        id: "",
        activities: [],
    };

    const [meetingData, setMeetingData] =
        useState<IMeetingCreation>(initialMeetingState);

    const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false);

    const handleAddActivity = (activity: IActivity) => {
        setMeetingData((prev) => ({
            ...prev,
            activities: [...prev.activities, activity],
        }));
    };

    const handleDeleteActivity = (index: number) => {
        setMeetingData((prev) => ({
            ...prev,
            activities: prev.activities.filter((_, i) => i !== index),
        }));
    };

    const handleInputChange = (
        field: "role" | "setting" | "id",
        value: string
    ) => {
        setMeetingData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = () => {
        // check for meeting id exists
        // navigate to meeting id
        onClose(); // Close dialog after submission
    };

    const handleDialogClose = () => {
        setMeetingData(initialMeetingState); // Reset state
        onClose(); // Notify parent to close dialog
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleDialogClose}>
            <DialogContent>
                <DialogHeader className="space-y-4">
                    <DialogTitle>Create a Meeting</DialogTitle>
                    <DialogDescription>
                        Fill in the details to create a meeting.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    {/* Role */}
                    <div className="space-y-4">
                        <label className="block text-sm font-medium">
                            Role
                        </label>
                        <Input
                            value={meetingData.role}
                            onChange={(e) =>
                                handleInputChange("role", e.target.value)
                            }
                            className="bg-black/25 text-white/75 border-white/15"
                            placeholder="Enter your role (e.g., Software Engineer, VP Design)"
                        />
                    </div>

                    {/* Setting */}
                    <div className="space-y-4">
                        <label className="block text-sm font-medium">
                            Setting
                        </label>
                        <Input
                            value={meetingData.setting}
                            onChange={(e) =>
                                handleInputChange("setting", e.target.value)
                            }
                            className="bg-black/25 text-white/75 border-white/15"
                            placeholder="Enter the setting (e.g., Standup Meeting, Club Meeting)"
                        />
                    </div>

                    {/* Activities */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label className="block text-sm font-medium">
                                Activities
                            </Label>
                        </div>
                        <Button
                            className="bg-green-500 text-white block flex items-center gap-2"
                            onClick={() => setIsActivityDialogOpen(true)}
                        >
                            Add Activity <PlusCircle />
                        </Button>
                        <ScrollArea className="h-48 w-full rounded-md bg-white/10 p-2">
                            {meetingData.activities.length > 0 ? (
                                meetingData.activities.map(
                                    (activity, index) => (
                                        <div
                                            key={index}
                                            className="p-4 text-sm rounded-md bg-white/10 mb-2 flex justify-between items-center"
                                        >
                                            <div className="flex justify-between w-full mr-8">
                                                <p className="font-medium">
                                                    <span className="opacity-25 mr-4">
                                                        $ item-{index}
                                                    </span>{" "}
                                                    {activity.title}
                                                </p>
                                                <p>
                                                    <span className="opacity-25 mr-4">
                                                        $ duration-min
                                                    </span>{" "}
                                                    {activity.duration}
                                                </p>
                                            </div>

                                            <Button
                                                variant="destructive"
                                                className="text-red-500 bg-red-500/35 w-8 h-8"
                                                onClick={() =>
                                                    handleDeleteActivity(index)
                                                }
                                            >
                                                <Trash2 />
                                            </Button>
                                        </div>
                                    )
                                )
                            ) : (
                                <p className="text-sm text-gray-500">
                                    $ activities empty
                                </p>
                            )}
                        </ScrollArea>
                    </div>

                    {/* Submit Button */}
                    <Button
                        className="bg-green-500 text-white mt-4 w-full"
                        onClick={handleSubmit}
                    >
                        Create Meeting
                    </Button>
                </div>
            </DialogContent>
            {isActivityDialogOpen && (
                <ActivityDialog
                    isOpen={isActivityDialogOpen}
                    onClose={() => setIsActivityDialogOpen(false)}
                    onSave={handleAddActivity}
                />
            )}
        </Dialog>
    );
}
