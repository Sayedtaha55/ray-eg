export function getThemeTemplatesViaMock(mockDb: any) {
  return mockDb.getThemeTemplates();
}

export function createThemeViaMock(mockDb: any, payload: any) {
  return mockDb.createTheme(payload);
}

export function updateThemeViaMock(mockDb: any, id: string, payload: any) {
  return mockDb.updateTheme(id, payload);
}

export function deleteThemeViaMock(mockDb: any, id: string) {
  return mockDb.deleteTheme(id);
}
