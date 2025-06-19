import ChatbotSession from './index.js';

async function test() {
  const session = new ChatbotSession();
  
  try {
    await session.initialize();
    console.log('Session initialized');
    
    const response1 = await session.sendMessage('What is the success rate of the merchant id 120121 in last 2 days?');
    console.log('Response:', response1);
    const response2 = await session.sendMessage('Yes i would like to know a bit detailed');
    console.log('Response:', response2);
    await session.close();
  } catch (error) {
    console.error('Test failed:', error);
  }
}

test();
