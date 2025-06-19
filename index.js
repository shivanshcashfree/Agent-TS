import { Agent, run, MCPServerStreamableHttp, withTrace } from '@openai/agents';

async function main() {
  const mcpServer = new MCPServerStreamableHttp({
    url: 'https://prod.cashfree.com/mcpsvc/sr-analytics/mcp',
    name: 'Success Rate MCP Server',
  });
  const agent = new Agent({
    name: 'GitMCP Assistant',
    instructions: 'Use the tools to respond to user requests.',
    mcpServers: [mcpServer],
  });

  try {
    await withTrace('Success Rate MCP Server Example', async () => {
      await mcpServer.connect();
      const result = await run(
        agent,
        'What is the success rate of the merchant id 603 in last 2 days?',
      );
      console.log(result.finalOutput);
    });
  } finally {
    await mcpServer.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});