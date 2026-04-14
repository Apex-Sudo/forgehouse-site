import { BaseAgentNode, type AgentRunParams } from "./BaseAgentNode";

export class ExtractionAgentNode extends BaseAgentNode<AgentRunParams> {
  constructor() {
    super("ExtractionAgent");
  }

  protected async runAgent(params: AgentRunParams): Promise<void> {
    if (this.checkGuardrail()) return;
    await this.streamWithToolLoop(params.systemPrompt, this.lcMessages, []);
  }
}
