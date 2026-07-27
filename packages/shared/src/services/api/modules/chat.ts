export type MessageSubscription = {
  unsubscribe: () => void;
};

export async function sendMessageViaMock(mockDb: any, msg: any) {
  return await mockDb.sendMessage(msg);
}

export async function getMessagesViaMock(mockDb: any, shopId: string, userId: string) {
  return await mockDb.getMessages(shopId, userId);
}

export async function getMerchantChatsViaMock(mockDb: any, shopId: string) {
  return await mockDb.getMerchantChats(shopId);
}

export function subscribeToMessagesViaMock(
  mockDb: any,
  shopId: string,
  callback: (payload: any) => void,
): MessageSubscription {
  return mockDb.subscribeToMessages(shopId, callback);
}
