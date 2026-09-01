import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ChevronDown,
  FileText,
  HelpCircle,
  Lock,
  PlayCircle,
  Video,
} from 'lucide-react';
import { clock } from '@/lib/format';
import { localized, useLocale, useT } from '@/lib/i18n';
import { tapLight } from '@/lib/native';
import { cn } from '@/lib/utils';
import type { CurriculumLesson, CurriculumModule } from '@/lib/types';

const strings = {
  curriculum: { en: 'Curriculum', ar: 'المحتوى' },
  modules: { en: '{n} modules', ar: '{n} وحدة' },
  lessons: { en: '{n} lessons', ar: '{n} درس' },
  preview: { en: 'Preview', ar: 'معاينة' },
  empty: { en: 'Curriculum coming soon', ar: 'المحتوى قريبًا' },
};

function LessonIcon({ type }: { type: CurriculumLesson['type'] }) {
  const Icon = type === 'VIDEO' ? Video : type === 'QUIZ' ? HelpCircle : FileText;
  return <Icon className="size-4" />;
}

function LessonRow({ lesson }: { lesson: CurriculumLesson }) {
  const { locale } = useLocale();
  const t = useT(strings);
  const title = localized(lesson, 'title', locale);
  const preview = !!lesson.isPreview;

  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <span
        className={cn(
          'grid size-9 shrink-0 place-items-center rounded-xl',
          preview ? 'bg-success/12 text-success' : 'bg-muted text-muted-foreground',
        )}
      >
        <LessonIcon type={lesson.type} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-semibold leading-snug">{title}</p>
        {!!lesson.durationSec && lesson.durationSec > 0 && (
          <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">
            {clock(lesson.durationSec)}
          </p>
        )}
      </div>

      {preview ? (
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-success/12 px-2.5 py-1 text-[11px] font-bold text-success">
          <PlayCircle className="size-3" />
          {t('preview')}
        </span>
      ) : (
        <Lock className="size-4 shrink-0 text-muted-foreground/60" />
      )}
    </li>
  );
}

function ModulePanel({ module: m, index }: { module: CurriculumModule; index: number }) {
  const { locale } = useLocale();
  const t = useT(strings);
  const [open, setOpen] = useState(index === 0);
  const title = localized(m, 'title', locale);

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-card">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => {
          void tapLight();
          setOpen((v) => !v);
        }}
        className="press flex w-full items-center gap-3 p-4 text-start"
      >
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/12 text-sm font-extrabold tabular-nums text-primary">
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-sm font-bold leading-snug">{title}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t('lessons', { n: m.lessons.length })}
          </p>
        </div>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="grid size-7 shrink-0 place-items-center rounded-full text-muted-foreground"
        >
          <ChevronDown className="size-5" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <ul className="divide-y divide-border/60 border-t border-border/60">
              {m.lessons.map((lesson) => (
                <LessonRow key={lesson.id} lesson={lesson} />
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Public curriculum: modules that expand to their lessons; first is open. */
export function CurriculumAccordion({ modules }: { modules: CurriculumModule[] }) {
  const t = useT(strings);
  const totalLessons = modules.reduce((n, m) => n + m.lessons.length, 0);

  if (modules.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/70 bg-card/40 px-4 py-8 text-center text-sm text-muted-foreground">
        {t('empty')}
      </div>
    );
  }

  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-lg font-extrabold">{t('curriculum')}</h2>
        <p className="text-xs font-medium text-muted-foreground">
          {t('modules', { n: modules.length })} · {t('lessons', { n: totalLessons })}
        </p>
      </div>
      <div className="space-y-3">
        {modules.map((m, i) => (
          <ModulePanel key={m.id} module={m} index={i} />
        ))}
      </div>
    </section>
  );
}
