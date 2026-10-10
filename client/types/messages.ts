import { FEEDBACK_KINDS, type Feedback } from './feedback';

export type AddActivePageMessage = { type: 'add-active-page'; tabId: number };

export type AddActivePageResponse = { feedback: Feedback };

export function isAddActivePageMessage(value: unknown): value is AddActivePageMessage {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<AddActivePageMessage>;
  return candidate.type === 'add-active-page' && Number.isInteger(candidate.tabId);
}

export function isAddActivePageResponse(value: unknown): value is AddActivePageResponse {
  if (typeof value !== 'object' || value === null) return false;
  const feedback = (value as Partial<AddActivePageResponse>).feedback;
  return (
    typeof feedback === 'object' &&
    feedback !== null &&
    FEEDBACK_KINDS.includes(feedback.kind) &&
    typeof feedback.text === 'string'
  );
}
