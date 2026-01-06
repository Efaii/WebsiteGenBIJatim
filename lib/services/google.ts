// This is a stub service for Google Drive/Sheets integration.
// authenticating with real Google APIs requires a Service Account Key/OAuth Client ID.

export const googleDriveService = {
    listFiles: async (folderId: string) => {
        console.log(`[MOCK] Listing files from Drive folder: ${folderId}`);
        return [
            { id: 'mock-1', name: 'Mock Document 1.pdf', mimeType: 'application/pdf' },
            { id: 'mock-2', name: 'Mock Sheet.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
        ];
    },

    getFile: async (fileId: string) => {
        console.log(`[MOCK] Getting file metadata: ${fileId}`);
        return { id: fileId, name: 'Mock File', webContentLink: '#' };
    }
};

export const googleSheetsService = {
    readSheet: async (spreadsheetId: string, range: string) => {
        console.log(`[MOCK] Reading sheet ${spreadsheetId} range ${range}`);
        return [
            ['Header 1', 'Header 2'],
            ['Row 1 Col 1', 'Row 1 Col 2'],
        ];
    },

    appendRow: async (spreadsheetId: string, values: any[]) => {
        console.log(`[MOCK] Appending row to ${spreadsheetId}:`, values);
        return { updates: { updatedCells: values.length } };
    }
};
