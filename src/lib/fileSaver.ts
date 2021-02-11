import * as fs from 'fs';

export default (targetPath: string, content: string) => {
    console.log('file saver ', targetPath);
    fs.writeFile(targetPath, content, { encoding: 'utf-8' }, () => {});
};
