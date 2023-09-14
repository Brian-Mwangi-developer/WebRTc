const { Server } = require('socket.io');

const io = new Server(8000, {
    cors: true,
});

const emailToSocketIdMap = new Map();
const socketIdToEmailMap = new Map();

io.on("connection", (socket) => {
    console.log(`socket Connected`, socket.id);//initiate connection
    socket.on("room:join", (data) => {
        const { email, room } = data
        emailToSocketIdMap.set(email, socket.id);//configure an email to a socket id
        socketIdToEmailMap.set(socket.id, email);
        io.to(room).emit('user:joined', { email, id: socket.id });// We tell everyone in the room that they've joined
        socket.join(room); // We let them enter the room
        io.to(socket.id).emit('room:join', data);//start communication
    });

    socket.on('user:call', ({ to, offer }) => {
        io.to(to).emit('incoming:call', { from: socket.id, offer });
    });
    socket.on('call:accepted', ({ to, ans }) => {
        io.to(to).emit('call:accepted', { from: socket.id, ans});

    })
    socket.on('peer:nego:needed', ({ to, offer  }) => {
        console.log("peer:nego:needed",offer);
        io.to(to).emit('peer:nego:needed', { from: socket.id, offer});
    })

    socket.on('peer:nego:done', ({ to, ans  }) => {
        console.log("peer:nego:done",ans);
        io.to(to).emit('peer:nego:final', { from: socket.id, ans});
    })

});