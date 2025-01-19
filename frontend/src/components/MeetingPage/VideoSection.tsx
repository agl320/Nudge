import React from "react";
import { Button } from "../ui/button";
import { Slider } from "../ui/slider";
import { ArrowLeft, ArrowRight, Mic, MicOff } from "lucide-react";

interface VideoSectionProps {
    localVideoRef: React.RefObject<HTMLVideoElement>;
    displayedStreams: [string, MediaStream][];
    handleLeftClick: () => void;
    handleRightClick: () => void;
    sliderValue: number[];
    handleChange: (value: number[]) => void;
    toggleMute: () => void;
    leaveMeeting: () => void;
    isAudioMuted: boolean;
}

export default function VideoSection({
    localVideoRef,
    displayedStreams,
    handleLeftClick,
    handleRightClick,
    sliderValue,
    handleChange,
    toggleMute,
    leaveMeeting,
    isAudioMuted,
}: VideoSectionProps) {
    return (
        <div className="w-full px-8">
            <video
                ref={localVideoRef}
                autoPlay
                muted
                style={{
                    transform: "scaleX(-1)",
                    width: "auto",
                    height: "auto",
                }}
                className="rounded-md"
            />

            <div className="flex mt-4">
                {displayedStreams.map(([id, stream], index) => (
                    <video
                        key={id}
                        autoPlay
                        playsInline
                        ref={(ref) => {
                            if (ref && !ref.srcObject) {
                                ref.srcObject = stream;
                            }
                        }}
                        style={{
                            transform: "scaleX(-1)",
                            width: "33.3333%",
                            height: "auto",
                            transition:
                                "border-color 0.3s ease, box-shadow 0.3s ease",
                        }}
                        className={`rounded-lg m-2`}
                    />
                ))}

                {Array.from({
                    length: Math.max(3 - displayedStreams.length, 0),
                }).map((_, index) => (
                    <div
                        key={`placeholder-${index}`}
                        style={{
                            width: "33.3333%",
                            height: "auto",
                            minHeight: "150px",
                            backgroundColor: "rgba(255, 255, 255, 0.1)",
                        }}
                        className={`rounded-lg flex items-center justify-center m-2`}
                    >
                        <p className="text-sm text-gray-500">No Participant</p>
                    </div>
                ))}
            </div>

            <div className="flex justify-between mt-4">
                <Button
                    className="bg-white/15 h-auto border border-white/15"
                    onClick={handleLeftClick}
                >
                    <ArrowLeft />
                </Button>
                <div className="bg-white/15 h-auto w-full mx-4 rounded-md flex p-4 justify-center border border-white/15">
                    <div className="w-full flex mr-6">
                        <div className="flex justify-between items-center ">
                            <p className="text-sm font-medium truncate">
                                Voice Sensitivity
                            </p>
                            <p className="bg-green-500/25 text-green-500 px-2 py-1 rounded-md text-xs truncate ml-4">
                                {sliderValue}%
                            </p>
                        </div>
                        <Slider
                            className="ml-4"
                            value={sliderValue}
                            onValueChange={handleChange}
                            max={100}
                            step={1}
                        />
                    </div>
                    <Button
                        className="text-black mr-2 bg-white"
                        onClick={toggleMute}
                    >
                        {isAudioMuted ? (
                            <>
                                Unmute
                                <Mic />
                            </>
                        ) : (
                            <>
                                Mute
                                <MicOff />
                            </>
                        )}
                    </Button>
                    <Button
                        className="text-white ml-2 bg-red-500"
                        onClick={leaveMeeting}
                    >
                        Leave Meeting
                    </Button>
                </div>
                <Button
                    className="bg-white/15 h-auto border border-white/15"
                    onClick={handleRightClick}
                >
                    <ArrowRight />
                </Button>
            </div>
        </div>
    );
}
