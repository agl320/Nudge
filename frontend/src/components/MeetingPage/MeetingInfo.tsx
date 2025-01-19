import React from "react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { ChevronRight } from "lucide-react";
import InfoBar from "./InfoBar";

interface Activity {
    title: string;
    duration: number;
}

interface MeetingInfoProps {
    meetingID: string;
    user: {
        uid: string;
        displayName: string;
    };
    remoteStreams: Record<string, MediaStream>;
    meetingData: {
        activities: Activity[];
    };
    onTopic: string;
    handleNextTopic: () => void;
}

export default function MeetingInfo({
    meetingID,
    user,
    remoteStreams,
    meetingData,
    onTopic,
    handleNextTopic,
}: MeetingInfoProps) {
    return (
        <div className="bg-white/10 border border-white/15 rounded-md p-2 mr-auto w-[700px] p-4 text-sm h-full flex flex-col justify-between">
            <div>
                <p className="text-white text-lg mb-4 font-semibold">Meeting</p>
                <Separator className="w-full bg-white/15 my-4" />
                <p className="text-md font-medium mb-4">Meeting info</p>
                <InfoBar label={"meeting-id"} value={meetingID || ""} />
                <InfoBar
                    className="mt-4"
                    label={"active-participants"}
                    value={Object.keys(remoteStreams).length + 1}
                />
                <Separator className="w-full bg-white/15 my-4" />
                <p className="text-md font-medium mb-4">User info</p>
                <InfoBar label={" user-uid"} value={user?.uid ?? ""} />
                <InfoBar
                    className="mt-4"
                    label={"user-displayName"}
                    value={user?.displayName ?? ""}
                />
                <Separator className="w-full bg-white/15 mb-4 mt-4" />
                <p className="text-md font-medium">Progress</p>
                <div className="w-full h-[250px] mt-4">
                    {meetingData?.activities.map((timeBlock, index) => {
                        const colorScaler = (index, total) => {
                            const green = Math.round(
                                165 + (90 * index) / (total - 1)
                            );
                            return `rgba(${green}, 255, 20, ${
                                onTopic === timeBlock.title ? "1" : "1"
                            })`;
                        };

                        return (
                            <div
                                key={index}
                                style={{
                                    height: `${
                                        (timeBlock.duration /
                                            meetingData?.activities.reduce(
                                                (sum, activity) =>
                                                    sum + activity.duration,
                                                0
                                            )) *
                                        100
                                    }%`,
                                }}
                                className="flex w-full justify-between mb-2"
                            >
                                {onTopic === timeBlock.title ? (
                                    <ChevronRight
                                        style={{
                                            color: colorScaler(
                                                index,
                                                meetingData?.activities.length
                                            ),
                                        }}
                                        className="w-6 h-6"
                                        strokeWidth={4}
                                    />
                                ) : (
                                    <ChevronRight
                                        style={{
                                            opacity: 0,
                                        }}
                                        className="w-6 h-6"
                                    />
                                )}
                                <div
                                    style={{
                                        backgroundColor: colorScaler(
                                            index,
                                            meetingData?.activities.length
                                        ),
                                    }}
                                    className="rounded-full pb-2 flex w-2 h-full pb-2 rounded-r-none"
                                ></div>
                                <div className="w-full h-full rounded-l-none">
                                    <div className="flex h-full bg-white/10 px-2 py-1 rounded-md justify-between inline-block">
                                        <p className="">{timeBlock.title}</p>
                                        <p className="opacity-25">
                                            {(
                                                (timeBlock.duration /
                                                    meetingData?.activities.reduce(
                                                        (sum, activity) =>
                                                            sum +
                                                            activity.duration,
                                                        0
                                                    )) *
                                                100
                                            ).toFixed(1)}
                                            %
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="w-full flex mt-2">
                    <Button
                        className="bg-green-500 text-white py-2 px-4 mt-8 w-1/2 mr-2"
                        onClick={handleNextTopic}
                    >
                        Start Meeting
                    </Button>
                    <Button
                        className="bg-green-500 text-white py-2 px-4 mt-8 float-right w-1/2 ml-2"
                        onClick={handleNextTopic}
                    >
                        Next topic <ChevronRight />
                    </Button>
                </div>
            </div>
        </div>
    );
}
