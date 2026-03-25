import { BaseAgentNode, type AgentRunParams } from "./BaseAgentNode";

export class OnboardingAgentNode extends BaseAgentNode<AgentRunParams> {
  constructor() {
    super("OnboardingAgent");
  }

  protected async runAgent(params: AgentRunParams): Promise<void> {
    if (this.checkGuardrail()) return;
    await this.streamWithToolLoop(params.systemPrompt, this.lcMessages, []);
  }
}
