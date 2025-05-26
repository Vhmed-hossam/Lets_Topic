import { saveAs } from "file-saver";

export async function downloadImage(url) {
  const response = await fetch(url);
  const blob = await response.blob();
  saveAs(blob, "image.png");
}

export async function downloadVideo(url) {
  const response = await fetch(url);
  const blob = await response.blob();
  saveAs(blob, 'video.mp4');
}