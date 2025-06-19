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
  
  async sendMessage(userMessage) {    
  try {    
    // Build conversation as a single string  
    if (!this.conversationHistory) {  
      this.conversationHistory = `User: ${userMessage}`;  
    } else {  
      this.conversationHistory += `\n\nUser: ${userMessage}`;  
    }  
      
    const result = await withTrace('Chatbot Session', async () => {    
      return await run(this.agent, this.conversationHistory);    
    });    
  
    // Add assistant response to history  
    this.conversationHistory += `\n\nAssistant: ${result.finalOutput}`;  
        
    return result.finalOutput;    
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