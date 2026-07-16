import React, { useState, useCallback, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketProvider";
import { UserContext } from "../context/userProvider";

const LobbyScreen = () => {
  const {userData} = useContext(UserContext);
  const [room, setRoom] = useState("");
  const [message, setMessage] = useState("");


  const socket = useSocket();
  const navigate = useNavigate();

  const handleSubmitForm = useCallback(
  (e) => {
    e.preventDefault();

    if (!room.trim()) {
      setMessage("Please enter Room ID");
      return;
    }

    socket.emit("room:join", {
      email: userData?.email,
      room,
      username: userData?.username
    });
  },
  [userData, room, socket]
);

  const handleJoinRoom = useCallback(
    (data) => {
      const { email, room, userData } = data;
      navigate(`/room/${room}`, {
        state: {
          isHost: false,
        },
      });
    },
    [navigate]
  );
  const handleCreateRoom = useCallback(() => {
  if (!room.trim()) {
    setMessage("Please enter Room ID");
    return;
  }

  socket.emit("room:create", {
    email: userData?.email,
    room,
    username: userData?.username
  });
}, [room, socket, userData]);

useEffect(() => {
  socket.on("room:created", ({ room }) => {
    navigate(`/room/${room}`, {
          state: {
            isHost: true,
      },
    });
  });

  return () => {
    socket.off("room:created");
  };
}, [socket, navigate]);

useEffect(() => {
  socket.on("room:error", ({ message }) => {
    setMessage(message);
  });

  return () => {
    socket.off("room:error");
  };
}, [socket]);

  useEffect(() => {
    socket.on("room:join", handleJoinRoom);
    return () => {
      socket.off("room:join", handleJoinRoom);
    };
  }, [socket, handleJoinRoom]);
  

 return (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
    <div className="w-full max-w-md bg-slate-800/70 backdrop-blur-md border border-slate-700 rounded-2xl shadow-2xl p-8">
      
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-600 flex items-center justify-center text-2xl">
          🎥
        </div>
        <h1 className="text-3xl font-bold text-white">
          Video Connect
        </h1>
        <p className="text-slate-400 mt-2">
          Join a room and start video calling
        </p>
      </div>

      <form onSubmit={handleSubmitForm} className="space-y-5">
        
        <div className="flex gap-4">
          <h2 className=" ext-sm font-medium text-slate-300">
            Email Address-
          </h2>
          <div className="text-white">
              {userData?.email}
          </div>
        </div>

        <div className="flex gap-4">
          <h2 className=" ext-sm font-medium text-slate-300">
            username-
          </h2>
          <div className="text-white">
              {userData?.username}
          </div>
        </div>

       <div>
          <label
            htmlFor="room"
            className="block text-sm font-medium text-slate-300 mb-2"
          >
            Room ID
          </label>
          <input
            type="text"
            id="room"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder="Enter room number"
            className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        {message && (
          <p className="text-red-400 text-center font-medium">
            {message}
          </p>
        )}
       

        <div className="flex gap-4 justify-center">
          <button
            type="button"
            onClick={handleCreateRoom}
            className="w-40 py-3 bg-orange-600 hover:bg-orange-700 transition-all duration-200 text-white font-semibold rounded-lg shadow-lg">
            Create Room
          </button>

         <button
          type="submit"
          className="w-40 cursor-pointer py-3 text-center bg-purple-600 hover:bg-purple-700 transition-all duration-200 text-white font-semibold rounded-lg shadow-lg"
        >
          Join Room
        </button>
        </div>

      </form>
    </div>
  </div>
);
};

export default LobbyScreen;
