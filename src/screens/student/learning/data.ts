import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { CourseProgress, I18nMap } from '@/lib/types';

/** A course row as returned by GET /communities/:id/courses. */
interface RawCourse {
  id: string;
  title: string;
  titleI18n?: I18nMap;
  thumbnailUrl?: string | null;
}

/** An enrolled course paired with its (best-effort) progress. */
export interface EnrolledCourse extends RawCourse {
  progress: CourseProgress | null;
}

/**
 * Loads the student's enrolled courses in one fan-out query:
 *   communities → their courses (deduped by id) → each course's progress.
 * Progress and per-community course lists fail soft so one bad row never
 * blanks the whole screen.
 */
export function useEnrolledCourses() {
  return useQuery({
    queryKey: ['learning', 'enrolled-courses'],
    queryFn: async ({ signal }): Promise<EnrolledCourse[]> => {
      const communities = await api.get<Array<{ id: string }>>('/communities', { signal });

      const lists = await Promise.all(
        communities.map((c) =>
          api
            .get<RawCourse[]>(`/communities/${c.id}/courses`, { signal })
            .catch(() => [] as RawCourse[]),
        ),
      );

      const byId = new Map<string, RawCourse>();
      for (const list of lists) {
        for (const course of list) if (!byId.has(course.id)) byId.set(course.id, course);
      }
      const courses = [...byId.values()];

      return Promise.all(
        courses.map(async (c) => ({
          ...c,
          progress: await api
            .get<CourseProgress>(`/courses/${c.id}/progress`, { signal })
            .catch(() => null),
        })),
      );
    },
  });
}

/** Whole-percent progress for a course (0 when unknown). */
export function pctOf(c: EnrolledCourse): number {
  return Math.max(0, Math.min(100, Math.round(c.progress?.percent ?? 0)));
}

/** Whether a course is fully finished. */
export function isDone(c: EnrolledCourse): boolean {
  const p = c.progress;
  return !!p && p.total > 0 && p.completed >= p.total;
}

/**
 * Pick the "Continue learning" hero: the furthest-along course that isn't
 * finished, else the first enrolled course.
 */
export function pickHero(courses: EnrolledCourse[]): EnrolledCourse | undefined {
  if (courses.length === 0) return undefined;
  const unfinished = courses.filter((c) => !isDone(c));
  if (unfinished.length === 0) return courses[0];
  return unfinished.reduce((best, c) => (pctOf(c) > pctOf(best) ? c : best));
}
