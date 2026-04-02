const initSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("⚡ Connected:", socket.id);

    // 🎥 Video Room
    socket.on("join:video", (videoId) => {
      socket.join(videoId);
      console.log(`User joined video room: ${videoId}`);
    });

    socket.on("leave:video", (videoId) => {
      socket.leave(videoId);
    });

    socket.on("joinChannel",(channelId)=>{
      socket.join(channelId);
      console.log(`User joined channel room: ${channelId}`);
    })

    socket.on("leaveChannel",(channelId)=>{
      socket.leave(channelId);
    })

    // 💬 Comment Room
    socket.on("join:comment", (commentId) => {
      socket.join(commentId);
      console.log(`User joined comment room: ${commentId}`);
    });

    socket.on("leave:comment", (commentId) => {
      socket.leave(commentId);
    });

    // 🐦 Tweet Room
    socket.on("join:tweet", (tweetId) => {
      socket.join(tweetId);
      console.log(`User joined tweet room: ${tweetId}`);
    });

    socket.on("leave:tweet", (tweetId) => {
      socket.leave(tweetId);
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected:", socket.id);
    });
  });
};

export { initSocket };