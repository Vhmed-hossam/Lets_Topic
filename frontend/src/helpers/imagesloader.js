export const preloadImages = (...imageGroups) => {
  const allUrls = imageGroups.flat();
  return Promise.all(
    allUrls.map((url) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = url;
        img.onload = () => resolve(img.url);
        img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      });
    })
  );
};
