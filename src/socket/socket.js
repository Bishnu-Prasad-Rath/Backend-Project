 const initSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("⚡ Connected:", socket.id);

    socket.on("joinVideo", (videoId) => {
      socket.join(videoId);
      console.log(`User joined video room: ${videoId}`);
    });

    socket.on("joinComment",(commentId)=>{
      socket.join(commentId);
      console.log(`User joined comment room: ${commentId}`);
    })

    socket.on("jointweet",(tweetId)=>{
        socket.join(tweetId);
        console.log(`User joined tweet room: ${tweetId}`);
    })

    socket.on("disconnect", () => {
      console.log(" Disconnected:", socket.id);
    });
  });
};
export { initSocket };
