import React from "react";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";

interface ActivityLogProps {
    chatStream: string[];
    leaveMeeting: () => void;
}

const OnTopicDisplay = (
    <>
        <p className="text-green-500 font-bold bg-green-500/15 font-bold inline-block px-4 py-2 rounded-md">
            ヽ(・∀・)ﾉ
        </p>
        <p className="mt-2">"( Discussion is running... )"</p>
    </>
);

const NextTopicDisplay = (
    <>
        <p className="text-yellow-500 bg-yellow-500/15 font-bold inline-block px-4 py-2 rounded-md">
            ＼(º □ º l|l)/
        </p>
        <p className="mt-2">{"( Proceed to next topic. )"}</p>
    </>
);

const OffTopicDisplay = (
    <>
        <p className="text-red-500 bg-red-500/15 font-bold inline-block px-4 py-2 rounded-md">
            ٩(ఠ益ఠ)۶
        </p>
        <p className="mt-2 text-white">{"( Convo is off topic! )"}</p>
    </>
);

const IdleDisplay = (
    <>
        <p className="text-white bg-white/15 font-bold inline-block px-4 py-2 rounded-md">
            ╮( ˘ ､ ˘ )╭
        </p>
        <p className="mt-2 text-white">{"( Nudge is Idle... )"}</p>
    </>
);

export default function ActivityLog({
    chatStream,
    leaveMeeting,
}: ActivityLogProps) {
    return (
        <div className="bg-white/10 border border-white/15 rounded-md p-4 mr-auto w-[700px] h-full flex flex-col">
            <div>
                <p className="text-white text-lg mb-4 font-semibold">
                    Activity
                </p>
                <Separator className="w-full bg-white/15 my-4" />
                <p className="text-md font-medium">Activity Log</p>
                <div className="h-[400px] w-full mt-4">
                    <ScrollArea className="border-none bg-white/15 w-full max-w-full h-full rounded-md border p-4 overflow-auto [&_*]:font-mono">
                        {chatStream.length > 0 ? (
                            chatStream.map((log, index) => (
                                <p key={index} className="text-white text-sm">
                                    {log}
                                </p>
                            ))
                        ) : (
                            <p className="text-white/50 text-xs">
                                No activity recorded yet.
                            </p>
                        )}
                    </ScrollArea>
                </div>
            </div>
            <div className="w-full flex flex-grow rounded-md mt-4 justify-center bg-white/5 overflow-hidden">
                <div className="flex flex-col justify-center">
                    <div className="text-center font-display text-2xl">
                        {OffTopicDisplay}
                    </div>
                </div>
            </div>
            <Button
                className="text-white bg-green-500 w-full mt-4"
                onClick={leaveMeeting}
            >
                Pause Topic-Check
            </Button>
        </div>
    );
}
