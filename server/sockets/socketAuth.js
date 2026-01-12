module.exports = function requireSocketAuth(socket) {
  const session = socket.request.session;
  if (!session || !session.userId) {
    throw new Error("UNAUTHORIZED");
  }
  return session.userId;
};
