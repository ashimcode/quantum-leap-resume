/** Transient request context only. No browser or server persistence. */
export type ConversationTurn = { role: 'user' | 'assistant'; text: string };
export const MAX_HISTORY_TURNS = 8;
export const MAX_QUESTION_LENGTH = 500;
export const MAX_ANSWER_LENGTH = 4000;

export function completedHistory(messages: readonly ConversationTurn[]): ConversationTurn[] {
  const pairs: ConversationTurn[] = [];
  for (let i = 1; i < messages.length; i++) {
    if (messages[i - 1].role === 'user' && messages[i].role === 'assistant') {
      pairs.push(messages[i - 1], messages[i]);
    }
  }
  return pairs.slice(-MAX_HISTORY_TURNS);
}

export function isConversationHistory(value: unknown): value is ConversationTurn[] {
  return Array.isArray(value) && value.length <= MAX_HISTORY_TURNS && value.length % 2 === 0 &&
    value.every((turn, index) => turn !== null && typeof turn === 'object' &&
      Object.keys(turn).every(key => key === 'role' || key === 'text') &&
      turn.role === (index % 2 === 0 ? 'user' : 'assistant') &&
      typeof turn.text === 'string' && turn.text.length > 0 &&
      turn.text.length <= (turn.role === 'user' ? MAX_QUESTION_LENGTH : MAX_ANSWER_LENGTH));
}
