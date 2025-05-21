import chokidar from 'chokidar';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const folderToWatch = path.join(__dirname, '..', '..', 'public', 'Avatars');
const avatarsFilePath = path.join(__dirname, 'avatars.js'); 

const watcher = chokidar.watch(folderToWatch, {
    ignored: /(^|[\/\\])\../,
    persistent: true
});

function updateAvatarsArray() {
    fs.readdir(folderToWatch, (err, files) => {
        if (err) {
            console.error('Error reading Avatars folder:', err);
            return;
        }

        const imageFiles = files.filter(file => {
            const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
            const fileExtension = path.extname(file).toLowerCase();
            return imageExtensions.includes(fileExtension);
        });

        const avatarsArray = imageFiles.map(file => `/Avatars/${file}`);

        const updatedData = `export const avatars = ${JSON.stringify(avatarsArray, null, 2)};`;

        fs.writeFile(avatarsFilePath, updatedData, (err) => {
            if (err) {
                console.error('Error updating avatars.js:', err);
            } else {
                console.log('avatars.js updated.');
            }
        });
    });
}
watcher
    .on('add', updateAvatarsArray)
    .on('unlink', updateAvatarsArray);
