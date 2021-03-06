const io = require('socket.io');
const ChatRoom =  require('../model/ChatRoom');

module.exports.socketHandler = function(server) {

    const ioSocket = io.listen(server);

    ioSocket.on('connection', (socket) =>{

        socket.on('joinRoom', (data) => {

            let parsedData = JSON.parse(data);

            socket.join(parsedData['roomId']);
            console.log(`${parsedData['userId']} joined room ${parsedData['roomId']}`);
        });

        socket.on('sendMessage', async (data) => {
            let parsedData = JSON.parse(data);


            console.log(`[${parsedData['roomId']}] ${parsedData['userId']} sent: ${parsedData['content']}`)

            const chatRoom = ChatRoom.findOne({_id: parsedData['roomId']});
            const messageObj = {
                userId: parsedData["userId"],
                content: parsedData["message"]
            }

            await chatRoom.updateOne({ $push: { messages: [messageObj] },});

            socket.to(parsedData['roomId']).emit("newMessage", {
                "userId" : parsedData["userId"],
                "message" : parsedData['message']
            });
        });

        console.log('a user is connected');
    });
}