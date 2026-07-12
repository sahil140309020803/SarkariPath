import { handleStartQuizGeneration } from '../services/quizGeneration/SchedulerEvents.js';

export const generateUserQuiz = async (req, res) => {
  const { socketId, ...payload } = req.body;
  if (!socketId) {
    return res.status(400).json({ success: false, message: "socketId is required" });
  }

  const io = req.app.get('socketio');
  if (!io) {
    return res.status(500).json({ success: false, message: "Socket server not initialized" });
  }

  const socket = io.sockets.sockets.get(socketId);
  if (!socket) {
    return res.status(400).json({ success: false, message: "Active socket connection not found" });
  }

  // Pass control to Scheduler Events Handler
  handleStartQuizGeneration(socket, io, payload);

  return res.status(200).json({ success: true, message: "User quiz generation queued" });
};
