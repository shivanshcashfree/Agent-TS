import express from 'express';
import cors from 'cors';
import ChatbotSession from './index.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

let globalSession = null;

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize a new chat session
app.post('/api/chat/new', async (req, res) => {
  try {
    globalSession = new ChatbotSession();
    await globalSession.initialize();
    
    res.json({
      success: true,
      message: 'Chat session initialized successfully'
    });
  } catch (error) {
    console.error('Error initializing chat session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initialize chat session',
      details: error.message
    });
  }
});

// Send a message using the existing session
app.post('/api/chat/message', async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'message is required'
      });
    }
    
    if (!globalSession) {
      return res.status(400).json({
        success: false,
        error: 'No active chat session. Please call /api/chat/new first'
      });
    }
    
    const result = await globalSession.sendMessage(message, conversationHistory);
    
    res.json({
      success: true,
      response: result.finalOutput,
      updatedHistory: result.updatedHistory
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send message',
      details: error.message
    });
  }
});

// Reset chat conversation history
app.post('/api/chat/reset', async (req, res) => {
  try {
    if (!globalSession) {
      return res.status(400).json({
        success: false,
        error: 'No active chat session. Please call /api/chat/new first'
      });
    }
    
    globalSession.resetChat();
    
    res.json({
      success: true,
      message: 'Chat history reset successfully'
    });
  } catch (error) {
    console.error('Error resetting chat:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset chat',
      details: error.message
    });
  }
});


// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    details: error.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Chat API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

export default app;