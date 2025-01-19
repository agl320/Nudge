import { useNavigate, useParams } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import io from "socket.io-client";
import VoiceRecorder from "@/audio";
import InfoBar from "./InfoBar";

import { Button } from "../ui/button";
import { Slider } from "../ui/slider";
import { useUser } from "reactfire";
import { Separator } from "../ui/separator";
import NavBar from "../NavBar/NavBar";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";

const socket = io("http://127.0.0.1:5555");

const exampleTimeBlockData = [
    {
        size: 0.2,
        label: "Introduction",
    },
    {
        size: 0.5,
        label: "Discussion",
    },
    {
        size: 0.3,
        label: "Conclusion",
    },
];

export default function Meeting() {
    const { status, data: user } = useUser();

    const { meetingID } = useParams();

    const navigate = useNavigate();

    const [remoteStreams, setRemoteStreams] = useState<{
        [key: string]: MediaStream;
    }>({}); // remote user streams
    const [isAudioMuted, setIsAudioMuted] = useState(false);
    const [talkingRemoteUsers, setTalkingRemoteUsers] = useState<Set<string>>(
        new Set()
    );

    const [sliderValue, setSliderValue] = useState<number[]>([33]); // Initialize with default value

    const handleChange = (value: number[]) => {
        setSliderValue(value); // Update the state when the slider changes
    };

    const localVideoRef = useRef<HTMLVideoElement>(null); // local video element
    const peerConnections = useRef<{ [key: string]: RTCPeerConnection }>({}); // map user ID to RTCPeerConnection
    const localStream = useRef<MediaStream | null>(null); // local media stream
    const voiceRecorderRef = useRef<VoiceRecorder | null>(null);

    // start local video/audio stream
    const startLocalStream = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: { echoCancellation: true, noiseSuppression: true },
            });
            localStream.current = stream; // save local stream
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream; // attach stream to video element
            }

            processAudio(stream);
        } catch (error) {
            console.error("Error accessing local media:", error);
        }
    };

    const processAudio = async (stream: MediaStream) => {
        voiceRecorderRef.current = new VoiceRecorder(
            stream,
            socket,
            meetingID || ""
        );
        voiceRecorderRef.current.start();
    };

    // set up WebRTC connections
    const setupWebRTC = async () => {
        const config = {
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        };

        // handle new user joining
        socket.on("user_joined", async ({ user_id }) => {
            const peerConnection = new RTCPeerConnection(config);
            peerConnections.current[user_id] = peerConnection; // save connection

            // add local stream tracks to peer connection
            localStream.current
                ?.getTracks()
                .forEach((track) =>
                    peerConnection.addTrack(track, localStream.current!)
                );

            // handle remote stream tracks
            peerConnection.ontrack = (event) => {
                setRemoteStreams((prev) => ({
                    ...prev,
                    [user_id]: event.streams[0], // save remote stream
                }));
            };

            // send ICE candidates
            peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit("signal", {
                        target: user_id,
                        candidate: event.candidate,
                    });
                }
            };

            // create offer and send to new user
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            socket.emit("signal", { target: user_id, sdp: offer });
        });

        // handle incoming signal (SDP/ICE)
        socket.on("signal", async ({ sender, sdp, candidate }) => {
            if (!peerConnections.current[sender]) {
                const peerConnection = new RTCPeerConnection(config);
                peerConnections.current[sender] = peerConnection;

                localStream.current
                    ?.getTracks()
                    .forEach((track) =>
                        peerConnection.addTrack(track, localStream.current!)
                    );

                peerConnection.ontrack = (event) => {
                    setRemoteStreams((prev) => ({
                        ...prev,
                        [sender]: event.streams[0],
                    }));
                };

                peerConnection.onicecandidate = (event) => {
                    if (event.candidate) {
                        socket.emit("signal", {
                            target: sender,
                            candidate: event.candidate,
                        });
                    }
                };
            }

            const peerConnection = peerConnections.current[sender];

            if (sdp) {
                await peerConnection.setRemoteDescription(
                    new RTCSessionDescription(sdp)
                );
                if (sdp.type === "offer") {
                    const answer = await peerConnection.createAnswer();
                    await peerConnection.setLocalDescription(answer);
                    socket.emit("signal", { target: sender, sdp: answer });
                }
            } else if (candidate) {
                await peerConnection.addIceCandidate(
                    new RTCIceCandidate(candidate)
                );
            }
        });

        // handle user leaving
        socket.on("user_left", ({ user_id }) => {
            if (peerConnections.current[user_id]) {
                peerConnections.current[user_id].close(); // close connection
                delete peerConnections.current[user_id];
            }
            setRemoteStreams((prev) => {
                const updatedStreams = { ...prev };
                delete updatedStreams[user_id]; // remove stream
                return updatedStreams;
            });
        });

        socket.on(
            "outlier_detected",
            ({ user_id, sentence }: { user_id: string; sentence: string }) => {}
        );

        socket.on("user_talking", ({ user_id }) => {
            console.log(`${user_id} is talking`);
            setTalkingRemoteUsers((prev) => {
                const newSet = new Set(prev);
                newSet.add(user_id);
                return newSet;
            });
            console.log(talkingRemoteUsers);
        });

        socket.on("user_not_talking", ({ user_id }) => {
            console.log(`${user_id} is not talking`);
            console.log(talkingRemoteUsers);
            setTalkingRemoteUsers((prev) => {
                const newSet = new Set(prev);
                newSet.delete(user_id);
                return newSet;
            });
            console.log(talkingRemoteUsers);
        });
    };

    // join meeting
    const joinMeeting = async () => {
        if (!meetingID) return; // require meeting ID
        await startLocalStream(); // start local video/audio
        await setupWebRTC(); // set up connections
        socket.emit("join_meeting", { meeting_id: meetingID }); // notify server
    };

    // leave meeting
    const leaveMeeting = () => {
        socket.emit("leave_meeting", { meeting_id: meetingID }); // notify server
        // stop recording audio
        voiceRecorderRef.current?.stop();
        // close all connections and stop local stream
        Object.values(peerConnections.current).forEach((pc) => pc.close());
        peerConnections.current = {};
        setRemoteStreams({});
        localStream.current?.getTracks().forEach((track) => track.stop());
        localStream.current = null;

        navigate("/meeting");
    };

    const toggleMute = () => {
        if (!localStream.current) return;
        const audioTrack = localStream.current.getAudioTracks()[0];
        if (audioTrack) {
            setIsAudioMuted(!isAudioMuted);
        }
        if (!audioTrack.enabled) {
            voiceRecorderRef.current?.start();
            audioTrack.enabled = true;
        } else {
            voiceRecorderRef.current?.stop();
            audioTrack.enabled = false;
        }
    };

    const removeSocketListeners = () => {
        socket.off("user_joined");
        socket.off("signal");
        socket.off("user_left");
        socket.off("user_talking");
        socket.off("user_not_talking");
    };

    useEffect(() => {
        joinMeeting();
        return removeSocketListeners;
    }, []);

    const [currentSliceIndex, setCurrentSliceIndex] = useState(0); // New state for slicing remote streams

    const handleLeftClick = () => {
        setCurrentSliceIndex((prev) => Math.max(0, prev - 3));
    };

    const handleRightClick = () => {
        setCurrentSliceIndex((prev) => {
            const maxIndex = Math.max(0, Object.keys(remoteStreams).length - 3);
            return Math.min(maxIndex, prev + 3);
        });
    };

    const displayedStreams = Object.entries(remoteStreams).slice(
        currentSliceIndex,
        currentSliceIndex + 3
    );

    const [onTopic, setOnTopic] = useState<string>(
        exampleTimeBlockData[1].label
    );

    if (status === "loading") {
        return <p>Loading...</p>;
    }

    return (
        <div className="h-screen w-screen bg-black bg-cover">
            <div className="h-full w-full bg-black max-w-full mx-auto flex flex-col flex-1 px-24">
                <NavBar user={user} />
                <div className="flex py-8 h-full">
                    <div className="bg-white/10 rounded-md p-2 mr-auto w-[700px] p-4 text-sm h-full flex flex-col justify-between">
                        <div>
                            <p className="text-white text-lg mb-4 font-semibold">
                                Settings
                            </p>
                            <Separator className="w-full bg-white/15 my-4" />
                            <p className="text-md font-medium mb-4">
                                Meeting info
                            </p>
                            <InfoBar
                                label={"meeting-id"}
                                value={meetingID || ""}
                            />
                            <InfoBar
                                className="mt-4"
                                label={"active-participants"}
                                value={Object.keys(remoteStreams).length + 1}
                            />
                            <Separator className="w-full bg-white/15 my-4" />
                            <p className="text-md font-medium mb-4">
                                User info
                            </p>
                            <InfoBar
                                label={" user-uid"}
                                value={user?.uid ?? ""}
                            />
                            <InfoBar
                                className="mt-4"
                                label={"user-displayName"}
                                value={user?.displayName ?? ""}
                            />
                            <Separator className="w-full bg-white/15 mb-4 mt-4" />
                            <p className="text-md font-medium">Progress</p>
                            <div className="w-full h-[150px] mt-4">
                                {exampleTimeBlockData.map(
                                    (timeBlock, index) => {
                                        // Generate a color based on the index, scaling from orange to yellow
                                        const colorScaler = (index, total) => {
                                            const green = Math.round(
                                                165 + (90 * index) / (total - 1)
                                            ); // Green increases from 165 to 255
                                            return `rgba(${green}, 255, 20, ${
                                                onTopic === timeBlock.label
                                                    ? "1"
                                                    : "0.50"
                                            })`; // RGB value for orange-to-yellow transition
                                        };

                                        return (
                                            <div
                                                key={index} // Add a key to each element in the map
                                                style={{
                                                    height: `${
                                                        timeBlock.size * 100
                                                    }%`,
                                                    backgroundColor:
                                                        colorScaler(
                                                            index,
                                                            exampleTimeBlockData.length
                                                        ), // Set background color
                                                }}
                                                className="rounded-md flex items-center justify-center text-xs text-black font-semibold mt-1"
                                            >
                                                {timeBlock.label}{" "}
                                                {/* Display the label for each block */}
                                            </div>
                                        );
                                    }
                                )}
                            </div>

                            <Separator className="w-full bg-white/15 mb-4 mt-6" />
                            <div className="">
                                <div className="flex justify-between">
                                    <p className="text-md font-medium">
                                        Voice Sensitivity
                                    </p>
                                    <p className="bg-green-500/25 text-green-500 px-2 py-1 rounded-md text-xs">
                                        {sliderValue}%
                                    </p>
                                </div>

                                <Slider
                                    className="mt-6 mb-2"
                                    value={sliderValue} // Bind to state
                                    onValueChange={handleChange} // Update state on change
                                    max={100}
                                    step={1}
                                />
                            </div>

                            {/* {exampleTimeBlockData} */}
                        </div>
                        {/* <div className="flex-grow bg-white/15 mt-6 rounded-md p-4 font-mono text-xs overflow-y-auto">
                            <p>[12:02] User A went off topic...</p>
                            <p>[12:02] User A went off topic...</p>
                        </div> */}
                        <div>
                            {/* <Button
                                className="text-white bg-green-600 w-full mt-8"
                                onClick={leaveMeeting}
                            >
                                Pause Topic-Check
                            </Button> */}
                            <div className="flex mt-8">
                                <Button
                                    className="text-black mr-2 bg-white w-1/2"
                                    onClick={toggleMute}
                                >
                                    {isAudioMuted ? "Unmute" : "Mute"}
                                </Button>
                                <Button
                                    className="text-white ml-2 bg-red-500 w-1/2"
                                    onClick={leaveMeeting}
                                >
                                    Leave Meeting
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div className="w-full px-8">
                        {/* <h1>Meeting</h1>
                        <p>Meeting ID: {meetingID}</p>
                        <p>
                            {Object.keys(remoteStreams).length + 1} users in
                            meeting
                        </p> */}
                        <video
                            ref={localVideoRef}
                            autoPlay
                            muted
                            style={{
                                transform: "scaleX(-1)",
                                width: "auto", // Limit width
                                height: "auto", // Maintain aspect ratio
                            }}
                            className="rounded-md"
                        />

                        <div className="flex mt-4">
                            {displayedStreams.map(([id, stream]) => (
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
                                        border: `4px solid ${
                                            talkingRemoteUsers.has(id)
                                                ? "#3ba55d"
                                                : "transparent"
                                        }`,
                                        transition:
                                            "border-color 0.3s ease, box-shadow 0.3s ease",
                                    }}
                                    className="rounded-lg"
                                />
                            ))}
                        </div>
                        <div className="flex justify-between mt-4">
                            <Button
                                className="bg-white/15"
                                onClick={handleLeftClick}
                            >
                                <ArrowLeft />
                            </Button>
                            <Button
                                className="bg-white/15"
                                onClick={handleRightClick}
                            >
                                <ArrowRight />
                            </Button>
                        </div>
                    </div>
                    <div className="bg-white/10 rounded-md p-4 mr-auto w-[700px] h-full flex flex-col">
                        <div>
                            <p className="text-white text-lg mb-4 font-semibold">
                                Nudge
                            </p>
                            <Separator className="w-full bg-white/15 my-4" />

                            <p className="text-md font-medium">Activity</p>
                            <div className="h-[300px] w-full mt-4">
                                <ScrollArea className="border-none bg-white/15 w-full max-w-full h-full rounded-md border p-4 overflow-auto [&_*]:font-mono">
                                    <p>[12:02] User A went off topic...</p>
                                    <p>[12:02] User A went off topic...</p>
                                    <p>[12:02] User A went off topic...</p>
                                    <p>[12:02] User A went off topic...</p>
                                    <p>[12:02] User A went off topic...</p>
                                    <p>[12:02] User A went off topic...</p>
                                    <p>[12:02] User A went off topic...</p>
                                    <p>[12:02] User A went off topic...</p>
                                    <p>[12:02] User A went off topic...</p>
                                    <p>[12:02] User A went off topic...</p>
                                    <p>[12:02] User A went off topic...</p>
                                    <p>[12:02] User A went off topic...</p>
                                    <p>[12:02] User A went off topic...</p>
                                    <p>[12:02] User A went off topic...</p>
                                    <p>[12:02] User A went off topic...</p>
                                    <p>[12:02] User A went off topic...</p>
                                </ScrollArea>
                            </div>
                            <Button
                                className="text-white bg-green-600 w-full mt-4"
                                onClick={leaveMeeting}
                            >
                                Pause Topic-Check
                            </Button>
                        </div>
                        <div className="w-full flex flex-col flex-grow rounded-md mt-4 justify-center">
                            <div className="flex justify-center">
                                <div className="text-center font-display text-2xl">
                                    <p className="text-green-500 font-bold">
                                        ヽ(・∀・)ﾉ
                                    </p>
                                    <p className="mt-2">You are on topic!</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
