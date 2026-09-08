// Generates a MongoDB ObjectId-shaped id (24 hex chars) client-side, so an offline write that
// creates a Mongo-backed document (see mutationQueue.js) can pick its own id up front and use
// it immediately -- ShapeUpApi's StartWorkoutExecutionCommand.Id (and any future client-
// correlated-id endpoint) accepts a pre-set id instead of always generating one server-side.
// Not a byte-for-byte ObjectId (no real machine/process discriminator) -- just needs to match
// the 24-hex-char shape and be collision-safe enough for one client's own session ids.
export const generateObjectId = () => {
    const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
    let random = '';
    for (let i = 0; i < 16; i++) {
        random += Math.floor(Math.random() * 16).toString(16);
    }
    return timestamp + random;
};
