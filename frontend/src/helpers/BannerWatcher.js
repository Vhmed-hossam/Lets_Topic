import chokidar from "chokidar";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const folderToWatch = path.join(__dirname, "..", "..", "Images", "Banners");
const BannersFilePath = path.join(__dirname, "Banners.js");

const watcher = chokidar.watch(folderToWatch, {
  ignored: /(^|[\/\\])\../,
  persistent: true,
});

function updateBannersArray() {
  fs.readdir(folderToWatch, (err, files) => {
    if (err) {
      console.error("Error reading Banners folder:", err);
      return;
    }

    const imageFiles = files.filter((file) => {
      const imageExtensions = [".png", ".jpg", ".jpeg", ".gif", ".webp"];
      const fileExtension = path.extname(file).toLowerCase();
      return imageExtensions.includes(fileExtension);
    });

    const BannersArray = imageFiles.map((file) => `/Banners/${file}`);

    const updatedData = `export const Banners = ${JSON.stringify(
      BannersArray,
      null,
      2
    )};`;

    fs.writeFile(BannersFilePath, updatedData, (err) => {
      if (err) {
        console.error("Error updating Banners.js:", err);
      } else {
        console.log("Banners.js updated.");
      }
    });
  });
}
watcher.on("add", updateBannersArray).on("unlink", updateBannersArray);
