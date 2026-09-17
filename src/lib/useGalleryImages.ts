export function useGalleryImages(category: string) {
  // Eagerly import all images from gallery subdirectories
  const modules = import.meta.glob(
    '/src/assets/gallery/*/*.{png,jpg,jpeg,webp,mp4,webm}',
    { eager: true, import: 'default' }
  );

  return Object.entries(modules)
    // Filter down to the requested category folder
    .filter(([path]) => path.includes(`/gallery/${category}/`))
    // Sort alphabetically by filename (so 01-img.webp comes before 02-img.webp)
    .sort(([a], [b]) => a.localeCompare(b))
    // Map to the object shape expected by our Masonry component
    .map(([path, src]) => ({ src: src as string, path }));
}
