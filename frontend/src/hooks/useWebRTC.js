import { useEffect, useRef, useState } from "react";

/**
 * Lightweight, robust WebRTC hook using native browser RTCPeerConnection.
 * Handles local audio/video stream capture and peer signaling via Socket.io.
 */
export default function useWebRTC(roomId, socket, remoteVideoRef) {
  const [localStream, setLocalStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);

  useEffect(() => {
    if (!socket || !roomId) return;

    const configuration = {
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    };

    const initWebRTC = async () => {
      try {
        // 1. Get user media
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localStreamRef.current = stream;
        setLocalStream(stream);

        // 2. Initialize RTCPeerConnection
        const pc = new RTCPeerConnection(configuration);
        pcRef.current = pc;

        // Add local tracks to peer connection
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });

        // Set up track handler for remote stream
        pc.ontrack = (event) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
        };

        // ICE candidate handler
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("webrtc-ice", { roomId, candidate: event.candidate });
          }
        };

        // Offer signaling receiver
        socket.on("webrtc-offer", async ({ sdp }) => {
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit("webrtc-answer", { roomId, sdp: answer });
        });

        // Answer signaling receiver
        socket.on("webrtc-answer", async ({ sdp }) => {
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        });

        // ICE candidate signaling receiver
        socket.on("webrtc-ice", async ({ candidate }) => {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (e) {
            console.warn("Failed to add ICE candidate:", e);
          }
        });

        // If peer is already joined, send an offer
        socket.on("user-joined", async () => {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit("webrtc-offer", { roomId, sdp: offer });
        });

      } catch (err) {
        console.warn("WebRTC media device request denied or failed:", err.message);
      }
    };

    initWebRTC();

    return () => {
      if (pcRef.current) {
        pcRef.current.close();
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (socket) {
        socket.off("webrtc-offer");
        socket.off("webrtc-answer");
        socket.off("webrtc-ice");
        socket.off("user-joined");
      }
    };
  }, [roomId, socket, remoteVideoRef]);

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  return {
    localStream,
    isMuted,
    isVideoOff,
    toggleMute,
    toggleVideo,
  };
}
