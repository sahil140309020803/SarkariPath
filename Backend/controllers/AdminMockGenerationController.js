import { generateAdminMockTest } from '../services/adminGeneration/AdminGenerationService.js';

export const generateAdminMock = async (req, res) => {
  const { socketId, ...payload } = req.body;
  if (!socketId) {
    return res.status(400).json({ success: false, message: "socketId is required" });
  }

  const io = req.app.get('socketio');
  if (!io) {
    return res.status(500).json({ success: false, message: "Socket server not initialized" });
  }

  // Run generation asynchronously to prevent API timeout
  generateAdminMockTest(io, socketId, payload);

  return res.status(200).json({ success: true, message: "Admin mock test generation started" });
};
