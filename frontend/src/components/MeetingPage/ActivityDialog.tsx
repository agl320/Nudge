import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

interface IActivity {
    duration: number;
    description: string;
    title: string;
}

interface ActivityDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (activity: IActivity) => void;
}

export default function ActivityDialog({
    isOpen,
    onClose,
    onSave,
}: ActivityDialogProps) {
    const [activity, setActivity] = useState<IActivity>({
        duration: 0,
        description: "",
        title: "",
    });

    const handleInputChange = (
        field: "duration" | "description" | "title",
        value: string | number
    ) => {
        setActivity((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        onSave(activity);
        onClose(); // Close the dialog after saving
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Activity</DialogTitle>
                </DialogHeader>
                <div className="">
                    {/* Title */}
                    <div className="space-y-4">
                        <label className="block text-sm font-medium">
                            Activity Title
                        </label>
                        <Input
                            className="bg-black/25 text-white/75 border-white/15"
                            value={activity.title}
                            onChange={(e) =>
                                handleInputChange("title", e.target.value)
                            }
                            placeholder="Enter activity title"
                        />
                    </div>

                    {/* Duration */}
                    <div className="space-y-4 mt-4">
                        <label className="block text-sm font-medium">
                            Duration (minutes)
                        </label>
                        <Input
                            className="bg-black/25 text-white/75 border-white/15"
                            type="number"
                            value={activity.duration}
                            onChange={(e) =>
                                handleInputChange(
                                    "duration",
                                    parseInt(e.target.value, 10)
                                )
                            }
                            placeholder="Enter duration"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-4 mt-4">
                        <label className="block text-sm font-medium">
                            Description
                        </label>
                        <Textarea
                            className="bg-black/25 text-white/75 border-white/15"
                            value={activity.description}
                            onChange={(e) =>
                                handleInputChange("description", e.target.value)
                            }
                            placeholder="Enter activity description"
                        />
                    </div>

                    {/* Save Button */}
                    <Button
                        className="bg-green-500 text-black mt-8 w-full text-white"
                        onClick={handleSave}
                    >
                        Save Activity
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
