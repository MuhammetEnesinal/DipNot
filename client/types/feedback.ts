export const FEEDBACK_KINDS = ['success', 'info', 'warning'] as const;

export type FeedbackKind = (typeof FEEDBACK_KINDS)[number];

export type Feedback = {
  kind: FeedbackKind;
  text: string;
};
