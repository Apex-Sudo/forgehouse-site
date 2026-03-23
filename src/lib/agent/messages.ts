import { HumanMessage, AIMessage, type BaseMessage } from "@langchain/core/messages";

export function toLangChainMessages(
  msgs: { role: "user" | "assistant"; content: string }[]
): BaseMessage[] {
  return msgs.map((m) =>
    m.role === "user"
      ? new HumanMessage(m.content)
      : new AIMessage(m.content)
  );
}
