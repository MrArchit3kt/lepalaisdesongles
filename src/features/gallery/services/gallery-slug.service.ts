import { prisma } from "@/lib/prisma";

const SLUG_SEPARATOR = "-";

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, SLUG_SEPARATOR)
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export async function generateUniqueGallerySlug(
  title: string,
): Promise<string> {
  const baseSlug = slugify(title);

  let slug = baseSlug || crypto.randomUUID();

  let index = 1;

  while (true) {
    const existing = await prisma.galleryItem.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
      },
    });

    if (!existing) {
      return slug;
    }

    slug = `${baseSlug}-${index}`;

    index++;
  }
}

export async function regenerateGallerySlug(
  title: string,
  galleryItemId: string,
): Promise<string> {
  const baseSlug = slugify(title);

  let slug = baseSlug || crypto.randomUUID();

  let index = 1;

  while (true) {
    const existing = await prisma.galleryItem.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
      },
    });

    if (!existing || existing.id === galleryItemId) {
      return slug;
    }

    slug = `${baseSlug}-${index}`;

    index++;
  }
}

export async function slugExists(
  slug: string,
): Promise<boolean> {
  const item = await prisma.galleryItem.findUnique({
    where: {
      slug,
    },
    select: {
      id: true,
    },
  });

  return item !== null;
}

export async function ensureGallerySlug(
  title: string,
  slug?: string | null,
): Promise<string> {
  if (!slug || slug.trim().length === 0) {
    return generateUniqueGallerySlug(title);
  }

  const normalized = slugify(slug);

  if (!(await slugExists(normalized))) {
    return normalized;
  }

  return generateUniqueGallerySlug(normalized);
}