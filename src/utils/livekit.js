import { AccessToken } from "livekit-server-sdk";

const createLiveToken = (roomName, user) => {
    const at = new AccessToken(
        process.env.LIVEKIT_API_KEY,
        process.env.LIVEKIT_API_SECRET,
        {
            identity: user._id.toString(),
            name: user.username,
        }
    );

    at.addGrant({
        roomJoin: true,
        room: roomName,
        canPublish: isStreamer,
        canSubscribe: true,
    })

    return at.toJwt();
}

export {
    createLiveToken,
}