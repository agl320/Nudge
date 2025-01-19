import { useNavigate, useParams } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import io from "socket.io-client";
import VoiceRecorder from "@/audio";
import InfoBar from "./InfoBar";

import { Button } from "../ui/button";
import { Slider } from "../ui/slider";
import { useUser } from "reactfire";
import { Separator } from "../ui/separator";


const socket = io("http://127.0.0.1:5555");

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

    if (status === "loading") {
        return <p>Loading...</p>;
    }

    return (
      <div className="h-screen w-screen bg-black ">
        <InfoBar 
          meetingId={meetingID || ''} 
          participantCount={Object.keys(remoteStreams).length} 
        />
  
        <div className="h-screen w-screen bg-black ">
            <div className="max-w-7xl mx-auto">
                <h1>Meeting</h1>
                <p>Meeting ID: {meetingID}</p>
                <p>{Object.keys(remoteStreams).length} users in meeting</p>
                <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    style={{
                        transform: "scaleX(-1)",
                        width: "500px", // Limit width
                        height: "auto", // Maintain aspect ratio
                    }}
                />
                <div>
                    {Object.entries(remoteStreams).map(([id, stream]) => (
                        <video
                            key={id}
                            autoPlay
                            playsInline
                            ref={(ref) => {
                                if (ref && !ref.srcObject) {
                                    ref.srcObject = stream; // attach remote stream
                                }
                            }}
                            style={{
                                transform: "scaleX(-1)",
                                position: "relative",
                                width: "100px",
                                height: "100px",
                                margin: "10px",
                                borderRadius: "50%",
                                border: `4px solid ${
                                    talkingRemoteUsers.has(id)
                                        ? "#3ba55d"
                                        : "transparent"
                                }`, // Green border when talking
                                transition:
                                    "border-color 0.3s ease, box-shadow 0.3s ease",
                            }}
                        />
                    ))}
                </div>
                <div className=" bg-white/10 border border-white/15 rounded-md p-2 mx-auto max-w-[400px] p-4 text-sm">
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
                    <Separator className="w-full bg-white/15 my-4" />
                    <div className="">
                        <div className="flex justify-between">
                            <p>
                                <span className="text-green-400">$ set</span>{" "}
                                voice-sensitivity
                            </p>
                            <p className="bg-green-500/25 text-green-500 px-2 py-1 rounded-md text-xs">
                                {sliderValue}%
                            </p>
                        </div>

                        <Slider
                            className="mt-4"
                            value={sliderValue} // Bind to state
                            onValueChange={handleChange} // Update state on change
                            max={100}
                            step={1}
                        />
                    </div>

                    <div className="flex mt-8">
                        <Button
                            className="text-black mr-2 bg-white w-1/2"
                            onClick={toggleMute}
                        >
                            {isAudioMuted ? "Unmute" : "Mute"}
                        </Button>
                        <Button
                            className="text-white bg-red-600 ml-2 w-1/2"
                            onClick={leaveMeeting}
                        >
                            Leave Meeting
                        </Button>
                    </div>
                </div>
            </div>
        </div>
      </div>
    );
}
