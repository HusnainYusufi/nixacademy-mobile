/**
 * API response shapes (captured from the live backend). Screens import these so
 * the whole app agrees on the contract.
 */
export type I18nMap = { en?: string; ar?: string };

/** A marketplace listing row — GET /marketplace/courses (array). */
export interface Listing {
  courseId: string;
  title: string;
  description: string | null;
  titleI18n?: I18nMap;
  descriptionI18n?: I18nMap;
  thumbnailUrl: string | null;
  academyName: string;
  academySlug: string;
  priceCents: number;
  compareAtPriceCents: number | null;
  currency: string;
  category: string | null;
  freeLessons: number;
  totalLessons: number;
  salesCount: number;
  boosted?: boolean;
  courseCount?: number;
  bundledCourses?: { courseId: string; title: string; titleI18n?: I18nMap }[];
}

/** A curriculum lesson stub (public detail). */
export interface CurriculumLesson {
  id: string;
  title: string;
  titleI18n?: I18nMap;
  type: 'VIDEO' | 'TEXT' | 'QUIZ' | 'ASSIGNMENT' | 'DOWNLOAD' | 'LIVE_REPLAY';
  durationSec?: number | null;
  isPreview?: boolean;
}
export interface CurriculumModule {
  id: string;
  title: string;
  titleI18n?: I18nMap;
  imageUrl?: string | null;
  lessons: CurriculumLesson[];
}

/** GET /marketplace/courses/:courseId — the public product page. */
export interface CourseDetail extends Listing {
  hasTrailer?: boolean;
  ogImageUrl?: string | null;
  curriculum: CurriculumModule[];
}

/** GET /courses/:id — the enrolled course tree (learn view). */
export interface Lesson {
  id: string;
  title: string;
  titleI18n?: I18nMap;
  type: CurriculumLesson['type'];
  durationSec?: number | null;
  locked?: boolean;
  videoAssetId?: string | null;
  body?: unknown;
}
export interface CourseTreeModule {
  id: string;
  title: string;
  titleI18n?: I18nMap;
  lessons: Lesson[];
}
export interface CourseTree {
  id: string;
  title: string;
  titleI18n?: I18nMap;
  modules: CourseTreeModule[];
}

/** GET /courses/:id/progress */
export interface CourseProgress {
  completed: number;
  total: number;
  percent: number;
}

/** POST /marketplace/orders/quote — server-priced cart. */
export interface QuoteLine {
  courseId: string;
  title: string;
  academyName: string;
  currency: string;
  unitPriceCents: number;
  discountCents: number;
  lineTotalCents: number;
  couponCode: string | null;
  couponError: { code: string; message: string } | null;
  unavailable: 'NOT_FOR_SALE' | 'ALREADY_OWNED' | null;
  bundledCourses: { courseId: string; title: string; thumbnailUrl: string | null }[];
  courseCount: number;
  alreadyOwnedCourseIds: string[];
}
export interface Quote {
  currency: string;
  lines: QuoteLine[];
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  free: boolean;
}
