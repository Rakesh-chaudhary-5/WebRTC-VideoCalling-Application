import React, { useEffect, useCallback, useState, useRef, use } from "react";
import ReactPlayer from "react-player";
import peer from "../service/peer";
import { useSocket } from "../context/SocketProvider";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const RoomPage = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  

  const { room } = useParams();
  const [remoteUsername,setRemoteUsername] = useState("");

  const location = useLocation();
  const [isHost] = useState(location.state?.isHost || false);
  console.log("LOCATION STATE:", location.state);
console.log("isHost:", isHost);

const navigate = useNavigate();
  
  // const [isHost, setIsHost] = useState(false);

  const [cameraOn, setCameraOn] = useState(false); ////////////
  const myVideoRef = useRef(null);
const remoteVideoRef = useRef(null);
//========-------------------------

useEffect(() => {
  if (myVideoRef.current && myStream) {
    myVideoRef.current.srcObject = myStream;
  }
}, [myStream]);

useEffect(() => {
  if (remoteVideoRef.current && remoteStream) {
    remoteVideoRef.current.srcObject = remoteStream;
  }
}, [remoteStream]);
//--------------------------------------------------

  const handleUserJoined = useCallback(({ email, id, username }) => {
    console.log(`Email ${email} joined room`);
    setRemoteSocketId(id);
    setRemoteUsername(username);
  }, []);

  // const handleCallUser = useCallback(async () => {
  //   const stream = await navigator.mediaDevices.getUserMedia({
  //     audio: true,
  //     video: true,
  //   });
  //   const offer = await peer.getOffer();
  //   socket.emit("user:call", { to: remoteSocketId, offer });
  //   setMyStream(stream);
  // }, [remoteSocketId, socket]);
  const handleCallUser = useCallback(async () => {
  if (!myStream) {
    alert("Please turn on camera first");
    return;
  }

  const offer = await peer.getOffer();

  socket.emit("user:call", {
    to: remoteSocketId,
    offer,
  });
}, [remoteSocketId, socket, myStream]);


//   const handleIncommingCall = useCallback(
//     async ({ from, offer }) => {
//       setRemoteSocketId(from);
//       // const stream = await navigator.mediaDevices.getUserMedia({
//       //   audio: true,
//       //   video: true,
//       // });
//       // setMyStream(stream);
//       if (!myStream) {
//   const stream = await navigator.mediaDevices.getUserMedia({
//     audio: true,
//     video: true,
//   });

//   setMyStream(stream);
//   setCameraOn(true);
// }
//       console.log(`Incoming Call`, from, offer);
//       const ans = await peer.getAnswer(offer);
//       socket.emit("call:accepted", { to: from, ans });
//     },
//     [socket]
//   );
const handleIncommingCall = useCallback(
  async ({ from, offer }) => {
    setRemoteSocketId(from);

    let stream = myStream;

    if (!stream) {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      setMyStream(stream);
      setCameraOn(true);
    }

    // JOINER SENDS STREAM TOO
    stream.getTracks().forEach((track) => {
      peer.peer.addTrack(track, stream);
    });

    const ans = await peer.getAnswer(offer);

    socket.emit("call:accepted", {
      to: from,
      ans,
    });
  },
  [socket, myStream]
);

  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
      console.log(myStream.getVideoTracks()[0]);
      peer.peer.addTrack(track, myStream);
    }
    console.log("SENDING TRACKS", myStream.getTracks().length);
  }, [myStream]);

  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      peer.setLocalDescription(ans);
      console.log("Call Accepted!");
      sendStreams();
    },
    [sendStreams]
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  const handleNegoNeedIncomming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      console.log("GOT TRACKS!!");
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncomming);
    socket.on("peer:nego:final", handleNegoNeedFinal);
    socket.on("room:host", handleHostInfo);
    socket.on("call:rejected", handleCallRejected);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncomming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
      socket.off("room:host", handleHostInfo);
      socket.off("call:rejected", handleCallRejected);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncommingCall,
    handleCallAccepted,
    handleNegoNeedIncomming,
    handleNegoNeedFinal,
  ]);
////////////////////////////////////////////////////////////////
const startCamera = async () => {
  try {
    // Camera already exists
    if (myStream) {
      const videoTrack = myStream.getVideoTracks()[0];

      if (videoTrack) {
        videoTrack.enabled = true;
      }

      setCameraOn(true);
      return;
    }

    // First time
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    setMyStream(stream);
    setCameraOn(true);
  } catch (err) {
    console.log(err);
  }
};

const stopCamera = () => {
  if (!myStream) return;

  const videoTrack = myStream.getVideoTracks()[0];

  console.log(
    "STOPPING:",
    videoTrack.id,
    videoTrack.enabled
  );

  videoTrack.enabled = false;

  console.log(
    "AFTER:",
    videoTrack.id,
    videoTrack.enabled
  );

  setCameraOn(false);
};
const handleHostInfo = useCallback(({ username, id }) => {
  setRemoteUsername(username);
  setRemoteSocketId(id);
}, []);

useEffect(() => {
  console.log("REGISTERING room:host");

  socket.on("room:host", handleHostInfo);

  return () => {
    socket.off("room:host", handleHostInfo);
  };
}, [socket, handleHostInfo]);

useEffect(() => {
  if (room) {
    socket.emit("get:host", { room });
  }
}, [room, socket]);

const handleRejectUser = useCallback(() => {
  socket.emit("call:reject", {
    to: remoteSocketId,
  });

  setRemoteSocketId(null);
  setRemoteUsername("");
}, [socket, remoteSocketId]);

const handleCallRejected = useCallback(() => {
  alert("Host rejected your request");

  setRemoteSocketId(null);
  setRemoteUsername("");
  setRemoteStream(null);

  navigate("/");
}, [navigate]);
///////////////////////////////////////////////////////////////////////
return (
   

  <div className="min-h-screen bg-slate-900 text-white p-6">
    
    {/* Header */}
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-end gap-10">
        <h1 className="text-3xl font-bold">🎥 Video Room</h1>
      <h1 className="text-xl font-semibold text-yellow-500 underline">Room id:- {room}</h1>
      </div>
      <div
        className={`px-4 py-2 rounded-full font-medium ${
          remoteSocketId
            ? "bg-green-500/20 text-green-400"
            : "bg-red-500/20 text-red-400"
        }`}
      >
        {remoteSocketId ? "🟢 Connected" : "🔴 Waiting for User"}
      </div>
    </div>

    

    {/* Action Buttons */}
    {/* <div className="flex gap-4">

  {!cameraOn ? (
    <button
      onClick={startCamera}
      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
    >
      🎥 Turn On Camera
    </button>
  ) : (
    <button
      onClick={stopCamera}
      className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold"
    >
      🚫 Turn Off Camera
    </button>
  )}

  {remoteSocketId && (
    <div className="flex flex-col items-center">
        <h1>-Join Request-</h1>
    <div
      className=" w-100 justify-evenly items-center text-black flex overflow-hidden bg-white rounded-lg font-semibold"
    >
      <div className="w-full text-center">Username:- {remoteUsername}</div>
      <button onClick={handleCallUser} className="bg-green-600 h-full w-full text-white hover:bg-green-700 cursor-pointer">
        <span className="  ">📞 Start Call</span>
      </button>
    </div>
    </div>
  )}

</div> */}
{/* Action Buttons */}
<div className="flex flex-wrap gap-4 items-center">

  {!cameraOn ? (
    <button
      onClick={startCamera}
      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold shadow-lg transition"
    >
      🎥 Turn On Camera
    </button>
  ) : (
    <button
      onClick={stopCamera}
      className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-semibold shadow-lg transition"
    >
      🚫 Turn Off Camera
    </button>
  )}

  {remoteSocketId && (
    <div className="bg-slate-800 border border-slate-700 rounded-xl px-5 py-3 flex items-center gap-4 shadow-lg">
      
      <div className="flex flex-col min-w-0">
      <span className="text-xs text-slate-400">
        User Joined
      </span>
      <span className="font-semibold text-white truncate max-w-[200px]">
        👤 {remoteUsername}
      </span>
    </div>
    {/* { remoteSocketId &&
      <div className="flex gap-">
      <button
        onClick={handleCallUser}
        className="px-5 py-2 cursor-pointer bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition"
      >
        📞Accept Call
      </button>

      <button
      onClick={handleRejectUser}
      className="px-5 py-2 bg-red-600 rounded-lg"
    >
      ❌ Reject
    </button>
      </div>
    } */}
    {isHost && (
  <div className="flex gap-2">
    <button
      onClick={handleCallUser}
      className="px-5 py-2 bg-green-600 rounded-lg"
    >
      📞 Accept
    </button>

    <button
      onClick={handleRejectUser}
      className="px-5 py-2 bg-red-600 rounded-lg"
    >
      ❌ Reject
    </button>
  </div>
)}
    </div>
  )}

</div>

    {/* Video Grid */}
    <div className="grid md:grid-cols-2 gap-6">
      
      {/* My Video */}
      {myStream && (
        <div className="bg-slate-800 rounded-2xl overflow-hidden shadow-xl border border-slate-700">
          <div className="px-4 py-3 border-b border-slate-700">
            <h2 className="font-semibold text-lg">
              My Camera
            </h2>
          </div>

        <div className="relative w-full h-full">
          <video
            ref={myVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-[450px] object-cover rounded-lg"
          />

  {!cameraOn && (
    <div className="absolute inset-0 bg-black flex items-center justify-center">
      <h2 className="text-white text-xl font-bold">
        📷 Camera Off
      </h2>
    </div>
  )}
</div>
</div>
      )}

      {/* Remote Video */}
      {remoteStream && (
        <div className="bg-slate-800 rounded-2xl overflow-hidden shadow-xl border border-slate-700">
          <div className="px-4 py-3 border-b border-slate-700">
            <h2 className="font-semibold text-lg">
              Remote User
            </h2>
          </div>

          <div className="p-4 flex justify-center">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-[450px] object-cover rounded-lg"
          />
          </div>
        </div>
      )}
    </div>

    {/* Empty State */}
    {!remoteStream && (
      <div className="mt-10 text-center text-slate-400">
        <p className="text-lg">
          Waiting for another participant to join...
        </p>
      </div>
    )}
  </div>
);
}

export default RoomPage;
