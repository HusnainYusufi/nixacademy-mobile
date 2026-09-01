import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, ChevronDown, Lock } from 'lucide-react';
import { clock } from '@/lib/format';
import { localized, useLocale, useT } from '@/lib/i18n';
import { tapLight } from '@/lib/native';
import { Progress } from '@/components/ui/misc';
import { cn } from '@/lib/utils';
import type { CourseTreeModule, Lesson } from '@/lib/types';
import { typeIcon } from './icons';

const strings = {
  curriculum: { en: 'Course content', ar: 'محتوى الدورة' },
  lessonsCount: { en: '{n} lessons', ar: '{n} درسًا' },
  VIDEO: { en: 'Video', ar: 'فيديو' },
  TEXT: { en: 'Reading', ar: 'قراءة' },
  QUIZ: { en: 'Quiz', ar: 'اختبار' },
  ASSIGNMENT: { en: 'Assignment', ar: 'مهمة' },
  DOWNLOAD: { en: 'Resource', ar: 'مورد' },
  LIVE_REPLAY: { en: 'Live replay', ar: 'إعادة بث' },
};

export function Curriculum({
  modules,
  statuses,
  selectedId,
  activeModuleId,
  onSelect,
}: {
  modules: CourseTreeModule[];
  statuses: Record<string, string>;
  selectedId: string | null;
  activeModuleId: string | null;
  onSelect: (id: string) => void;
}) {
  const t = useT(strings);
  const { locale: loc } = useLocale();
  const [open, setOpen] = useState<Set<string>>(
    () => new Set(activeModuleId ? [activeModuleId] : []),
  );

  // Keep the module that owns the current lesson expanded (e.g. after advancing
  // into the next module via "Complete & continue").
  useEffect(() => {
    if (!activeModuleId) return;
    setOpen((prev) => (prev.has(activeModuleId) ? prev : new Set(prev).add(activeModuleId)));
  }, [activeModuleId]);

  const toggle = (id: string) => {
    void tapLight();
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const total = modules.reduce((n, m) => n + m.lessons.length, 0);

  // Running 1-based number across the whole course for the "not started" index.
  let running = 0;

  return (
    <section className="mt-6">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="text-lg font-extrabold">{t('curriculum')}</h2>
        <span className="shrink-0 text-xs font-medium text-muted-foreground">
          {t('lessonsCount', { n: total })}
        </span>
      </div>

      <div className="space-y-3">
        {modules.map((m, i) => {
          const done = m.lessons.filter((l) => statuses[l.id] === 'COMPLETED').length;
          const allDone = m.lessons.length > 0 && done === m.lessons.length;
          const isOpen = open.has(m.id);
          const pct = m.lessons.length ? Math.round((done / m.lessons.length) * 100) : 0;

          return (
            <div
              key={m.id}
              className={cn(
                'overflow-hidden rounded-2xl border bg-card shadow-card transition-colors',
                m.id === activeModuleId ? 'border-primary/30' : 'border-border/70',
              )}
            >
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => toggle(m.id)}
                className="press flex w-full items-center gap-3 p-3.5 text-start"
              >
                <span
                  className={cn(
                    'grid size-8 shrink-0 place-items-center rounded-lg text-sm font-extrabold tabular-nums',
                    allDone ? 'bg-success/15 text-success' : 'bg-primary/12 text-primary',
                  )}
                >
                  {allDone ? <Check className="size-4" /> : i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="line-clamp-2 text-sm font-bold leading-snug">
                    {localized(m, 'title', loc)}
                  </h3>
                  <div className="mt-1.5 flex items-center gap-2">
                    <Progress value={pct} className="h-1 w-full max-w-[120px] flex-1" />
                    <span className="shrink-0 text-[11px] font-semibold tabular-nums text-muted-foreground">
                      {done}/{m.lessons.length}
                    </span>
                  </div>
                </div>
                <motion.span
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="grid size-7 shrink-0 place-items-center rounded-full text-muted-foreground"
                >
                  <ChevronDown className="size-5" />
                </motion.span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="body"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <ul className="border-t border-border/60 p-1.5">
                      {m.lessons.map((l) => {
                        running += 1;
                        return (
                          <LessonRow
                            key={l.id}
                            lesson={l}
                            index={running}
                            done={statuses[l.id] === 'COMPLETED'}
                            active={l.id === selectedId}
                            onSelect={onSelect}
                            t={t}
                          />
                        );
                      })}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function LessonRow({
  lesson,
  index,
  done,
  active,
  onSelect,
  t,
}: {
  lesson: Lesson;
  index: number;
  done: boolean;
  active: boolean;
  onSelect: (id: string) => void;
  t: (key: keyof typeof strings, vars?: Record<string, string | number>) => string;
}) {
  const { locale } = useLocale();
  const locked = !!lesson.locked;
  const title = localized(lesson, 'title', locale);
  const Icon = typeIcon[lesson.type];
  const duration = lesson.durationSec ?? 0;

  return (
    <li>
      <button
        type="button"
        disabled={locked}
        onClick={() => !locked && onSelect(lesson.id)}
        className={cn(
          'flex w-full items-start gap-3 rounded-xl px-2.5 py-2.5 text-start transition-colors',
          active ? 'bg-primary/10 ring-1 ring-inset ring-primary/25' : 'hover:bg-muted/60',
          locked ? 'cursor-not-allowed' : 'press',
        )}
      >
        <Lead done={done} locked={locked} active={active} index={index} />

        <div className="min-w-0 flex-1">
          <p
            className={cn(
              'line-clamp-2 text-sm font-semibold leading-snug',
              active && 'text-primary',
              locked && 'text-muted-foreground',
            )}
          >
            {title}
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Icon className="size-3.5 shrink-0" />
            <span className="truncate">{t(lesson.type)}</span>
            {duration > 0 && (
              <>
                <span aria-hidden className="text-muted-foreground/50">
                  ·
                </span>
                <span className="tabular-nums">{clock(duration)}</span>
              </>
            )}
          </div>
        </div>

        {active && !done && <Equalizer />}
      </button>
    </li>
  );
}

function Lead({
  done,
  locked,
  active,
  index,
}: {
  done: boolean;
  locked: boolean;
  active: boolean;
  index: number;
}) {
  if (done)
    return (
      <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-success/15 text-success">
        <Check className="size-4" />
      </span>
    );
  if (locked)
    return (
      <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground/70">
        <Lock className="size-3.5" />
      </span>
    );
  return (
    <span
      className={cn(
        'mt-0.5 grid size-7 shrink-0 place-items-center text-xs font-bold tabular-nums',
        active ? 'text-primary' : 'text-muted-foreground/70',
      )}
    >
      {index}
    </span>
  );
}

/** "Now playing" equalizer for the active lesson. */
function Equalizer() {
  return (
    <span className="mt-1 flex h-4 shrink-0 items-end gap-[2px]" aria-hidden>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-[3px] rounded-full bg-primary"
          animate={{ height: [4, 14, 6, 12, 4] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut', delay: i * 0.15 }}
        />
      ))}
    </span>
  );
}
