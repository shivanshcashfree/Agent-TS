import { Agent, run, MCPServerStreamableHttp, withTrace } from '@openai/agents';  
import { agentInstructions } from './instructions/agentInstructions.js';  
import 'dotenv/config';  

class ChatbotSession {  
  constructor() {
    this.agent = null;
    this.mcpServer = null;
    this.conversationHistory = null; 
    
    this.mcpServer = new MCPServerStreamableHttp({  
      url: 'https://prod.cashfree.com/mcpsvc/sr-analytics/mcp',  
      name: 'Success Rate MCP Server',  
    });  
      
    this.agent = new Agent({  
      name: 'MCP Assistant',  
      instructions: agentInstructions,  
      model: 'gpt-4o', 
      mcpServers: [this.mcpServer],  
    });  
  }  
  
  async initialize() {  
    try {
      await this.mcpServer.connect();  
      console.log('MCP Server connected successfully');
    } catch (error) {
      console.error('Failed to connect MCP Server:', error);
      throw error;
    }
  }  
  
  async sendMessage(userMessage, conversationHistory) {    
    try {    
      // Build conversation as a single string  
      let conversation;
      if (!conversationHistory) {  
        conversation = `User: ${userMessage}`;  
      } else {  
        conversation = `${conversationHistory}\n\nUser: ${userMessage}`;  
      }  
        
      const result = await withTrace('Chatbot Session', async () => {    
        return await run(this.agent, conversation);    
      });    
  
      // Return both the assistant response and the updated conversation
      const updatedHistory = `${conversation}\n\nAssistant: ${result.finalOutput}`;
      return { finalOutput: result.finalOutput, updatedHistory };
    } catch (error) {    
      console.error('Error in chat session:', error);    
      throw error;    
    }    
  }
  
  resetChat() {
    this.conversationHistory = null;
  }
  
  async close() {  
    try {
      if (this.mcpServer) {
        await this.mcpServer.close();  
        console.log('MCP Server closed successfully');
      }
    } catch (error) {
      console.error('Error closing MCP Server:', error);
    }
  }  
}

export default ChatbotSession;