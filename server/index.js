const { Server } = require("socket.io");

const io = new Server(PORT, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
});
// const io = new Server(8000, {
//   cors: true,
// });

const socketIdToUsernameMap = new Map();

const rooms = new Set();

const emailToSocketIdMap = new Map();
const socketidToEmailMap = new Map();

io.on("connection", (socket) => {
  console.log("Socket Connected", socket.id);

  // CREATE ROOM
  socket.on("room:create", ({ email, room, username }) => {

    socketIdToUsernameMap.set(socket.id, username);

    if (rooms.has(room)) {
      io.to(socket.id).emit("room:error", {
        message: "Room already exists",
      });
      return;
    }

    rooms.add(room);

    emailToSocketIdMap.set(email, socket.id);
    socketidToEmailMap.set(socket.id, email);

    socket.join(room);

    io.to(socket.id).emit("room:created", {
      room,
      email,
      username
    });
  });

  // JOIN ROOM
  socket.on("room:join",async({ email, room, username }) => {
      socketIdToUsernameMap.set(socket.id, username);


    if (!rooms.has(room)) {
      io.to(socket.id).emit("room:error", {
        message: "No room available",
      });
      return;
    }
    

    emailToSocketIdMap.set(email, socket.id);
    socketidToEmailMap.set(socket.id, email);

    socket.join(room);

    io.to(room).emit("user:joined", {
      email,
      id: socket.id,
      username
    });

    io.to(socket.id).emit("room:join", {
      room,
      email,
      username
    });

    const clients = await io.in(room).fetchSockets();

    const creator = clients.find(s => s.id !== socket.id);

    if (creator) {
      io.to(socket.id).emit("room:host", {
        username: socketIdToUsernameMap.get(creator.id),
        id: creator.id,
      });
    }

    console.log("CLIENTS:", clients.map(c => c.id));
console.log("CURRENT:", socket.id);
console.log("CREATOR:", creator?.id);
console.log(
  "CREATOR USERNAME:",
  socketIdToUsernameMap.get(creator?.id)
);
  });
  
  ///host
  socket.on("get:host", async ({ room }) => {
  const clients = await io.in(room).fetchSockets();

  const creator = clients.find(s => s.id !== socket.id);

  if (creator) {
    socket.emit("room:host", {
      username: socketIdToUsernameMap.get(creator.id),
      id: creator.id,
    });
  }
});
socket.on("call:reject", ({ to }) => {
  io.to(to).emit("call:rejected");
});

  socket.on("user:call", ({ to, offer,username }) => {
    io.to(to).emit("incomming:call", {
      from: socket.id,
      offer,
      username
    });
  });

  socket.on("call:accepted", ({ to, ans }) => {
    io.to(to).emit("call:accepted", {
      from: socket.id,
      ans,
    });
  });

  socket.on("peer:nego:needed", ({ to, offer }) => {
    io.to(to).emit("peer:nego:needed", {
      from: socket.id,
      offer,
    });
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    io.to(to).emit("peer:nego:final", {
      from: socket.id,
      ans,
    });
  });
});


