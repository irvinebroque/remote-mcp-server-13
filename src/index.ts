import app from "./app";
import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import OAuthProvider from "@cloudflare/workers-oauth-provider";

export class MyMCP extends McpAgent {
	server = new McpServer({
		name: "Demo",
		version: "1.0.0",
	});

	initialState = {
		counter: 1,
	};
	

	async init() {
		this.server.resource(`counter`, `mcp://resource/counter`, (uri) => {
			return {
			  contents: [{ uri: uri.href, text: String(this.state.counter) }],
			};
		  });

		  this.server.tool(
			"add",
			"Add to the counter, stored in the MCP",
			{ a: z.number() },
			async ({ a }) => {
			  this.setState({ ...this.state, counter: this.state.counter + a });
	  
			  return {
				content: [
				  {
					type: "text",
					text: String(`Added ${a}, total is now ${this.state.counter}`),
				  },
				],
			  };
			},
		  );

	}
}

// Export the OAuth handler as the default
export default new OAuthProvider({
	apiRoute: "/sse",
	// TODO: fix these types
	// @ts-ignore
	apiHandler: MyMCP.mount("/sse"),
	// @ts-ignore
	defaultHandler: app,
	authorizeEndpoint: "/authorize",
	tokenEndpoint: "/token",
	clientRegistrationEndpoint: "/register",
});
