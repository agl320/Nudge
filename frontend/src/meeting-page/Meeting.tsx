import { useParams } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import io from "socket.io-client";
import VoiceRecorder from "../audio";
import { join } from "path";

const socket = io("http://127.0.0.1:5555");

export default function Meeting() {

    const { meetingID } = useParams();

    const [remoteStreams, setRemoteStreams] = useState<{[key: string]: MediaStream;}>({}); // remote user streams

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
        voiceRecorderRef.current = new VoiceRecorder(stream, socket, meetingID || "")
        voiceRecorderRef.current.start();
    }


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
    };

    const removeSocketListeners = () => {
        socket.off("user_joined");
        socket.off("signal");
        socket.off("user_left");
    }

    

    useEffect(() => {
        joinMeeting();
        return removeSocketListeners;
    }, [])


    return (
        <div>
            <h1>Meeting</h1>
            <p>Meeting ID: {meetingID}</p>
            <p>{Object.keys(remoteStreams).length} users in meeting</p>
            <video ref={localVideoRef} autoPlay muted style={{ transform: 'scaleX(-1)' }} />
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
                        style={{ transform: 'scaleX(-1)' }}
                    />
                ))}
            </div>
            <button onClick={leaveMeeting}>Leave Meeting</button>
        </div>
    );
}