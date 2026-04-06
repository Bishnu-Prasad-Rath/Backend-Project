const initSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("⚡ Connected:", socket.id);

    // 🎥 Video Room
    socket.on("join:video", (videoId) => {
      socket.join(`video:${videoId}`);
      console.log(`User joined video room: ${videoId}`);
    });

    socket.on("leave:video", (videoId) => {
      socket.leave(`video:${videoId}`);
    });

    socket.on("joinChannel", (channelId) => {
      socket.join(`channel:${channelId}`);
      console.log(`User joined channel room: ${channelId}`);
    });

    socket.on("leaveChannel", (channelId) => {
      socket.leave(`channel:${channelId}`);
    });

    // 💬 Comment Room
    socket.on("join:comment", (commentId) => {
      socket.join(`comment:${commentId}`);
      console.log(`User joined comment room: ${commentId}`);
    });

    socket.on("leave:comment", (commentId) => {
      socket.leave(`comment:${commentId}`);
    });

    // 🐦 Tweet Room
    socket.on("join:tweet", (tweetId) => {
      socket.join(`tweet:${tweetId}`);
      console.log(`User joined tweet room: ${tweetId}`);
    });

    socket.on("leave:tweet", (tweetId) => {
      socket.leave(`tweet:${tweetId}`);
    });

    socket.on("join:live", async (liveId) => {
      socket.join(`live:${liveId}`);

      //  store liveId in socket (important)
      socket.liveId = liveId;
      //  increment viewers
      const viewers = await redisClient.incr(`live:${liveId}:viewers`);
      //  broadcast updated count
      io.to(`live:${liveId}`).emit("live:viewers", viewers);

      console.log(`👀 Viewer joined live ${liveId}: ${viewers}`);
    });

    socket.on("live:message", ({ liveId, message, user }) => {
      io.to(`live:${liveId}`).emit("live:message", {
        message,
        user,
        createdAt: new Date(),
      });
    });

    socket.on("disconnect", async () => {
      console.log("❌ Disconnected:", socket.id);

      if (socket.liveId) {
        const key = `live:${socket.liveId}:viewers`;

        let viewers = await redisClient.decr(key);

        // ✅ prevent negative
        if (viewers < 0) {
          viewers = 0;
          await redisClient.set(key, 0);
        }

        io.to(`live:${socket.liveId}`).emit("live:viewers", viewers);

        console.log(`❌ Viewer left live ${socket.liveId}: ${viewers}`);
      }
    });
  });
};

export { initSocket };
