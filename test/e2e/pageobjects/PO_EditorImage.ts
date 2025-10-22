import { ElectronMock } from '@wdio/electron-types';
import path from 'path';

export default class POEditorImage {
    private static mockedShowOpenDialog: ElectronMock;

    static async mockImageDialog(testImageName: string) {
        this.mockedShowOpenDialog = await browser.electron.mock('dialog', 'showOpenDialog');
        const imagePath = path.join(__dirname, '../resources', testImageName);
        await this.mockedShowOpenDialog.mockResolvedValue({
            canceled: false,
            filePaths: [imagePath]
        });
        return imagePath;
    }
}
