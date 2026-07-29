export type PublicGalleryItem = {
    id: string;
    slug: string;
    title: string;
    coverUrl: string;
    alt?: string | null;
    category?: string | null;
    serviceName?: string | null;
    isFeatured: boolean;
  };