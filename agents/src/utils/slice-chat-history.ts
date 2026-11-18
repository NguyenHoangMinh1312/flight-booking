import { AgentInputItem } from "@openai/agents";

export const sliceChatHistory = (
  history: AgentInputItem[],
  maxUserTurns = 10,
) => {
  let userTurnCount = 0;

  for (let i = history.length - 1; i >= 0; i--) {
    const message = history[i];
    if (message && "role" in message && message.role === "user") {
      userTurnCount++;
      if (userTurnCount === maxUserTurns) return history.slice(i);
    }
  }

  return history;
};
