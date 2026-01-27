export function getFeedbackViaMock(mockDb: any) {
  return mockDb.getFeedback();
}

export async function saveFeedbackViaMock(_feedbackData: any) {
  return { error: null };
}
