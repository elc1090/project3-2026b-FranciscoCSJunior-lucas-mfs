import { dimStyle } from '@/components/sostenpyme';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/i18n';
import { learnCards } from '@/lib/learn-cards';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';

/** Cards informativos do Início. Rola com encaixe (arrastar no celular), setas, pontos ou teclado. */
export function LearnCarousel() {
    const { t, tl } = useTranslation();
    const track = useRef<HTMLDivElement>(null);
    const [current, setCurrent] = useState(0);
    const last = learnCards.length - 1;

    const goTo = useCallback((index: number) => {
        const el = track.current;
        if (!el) return;
        const target = Math.max(0, Math.min(index, learnCards.length - 1));
        el.scrollTo({ left: target * el.clientWidth, behavior: 'smooth' });
    }, []);

    useEffect(() => {
        const el = track.current;
        if (!el) return;
        const onScroll = () => setCurrent(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)));
        el.addEventListener('scroll', onScroll, { passive: true });
        return () => el.removeEventListener('scroll', onScroll);
    }, []);

    const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            goTo(current + 1);
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            goTo(current - 1);
        }
    };

    return (
        <section aria-roledescription="carousel" aria-label={t('home.learn.title')}>
            <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                    <h2 className="text-xl font-semibold">{t('home.learn.title')}</h2>
                    <p className="text-muted-foreground mt-1 text-sm">{t('home.learn.description')}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                    <span className="text-muted-foreground mr-1 text-sm tabular-nums" aria-live="polite">
                        {t('home.learn.position', { current: current + 1, total: learnCards.length })}
                    </span>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => goTo(current - 1)}
                        disabled={current === 0}
                        aria-label={t('home.learn.previous')}
                    >
                        <ChevronLeft aria-hidden />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => goTo(current + 1)}
                        disabled={current === last}
                        aria-label={t('home.learn.next')}
                    >
                        <ChevronRight aria-hidden />
                    </Button>
                </div>
            </div>

            <div
                ref={track}
                tabIndex={0}
                onKeyDown={onKeyDown}
                className="focus-visible:ring-ring flex w-0 min-w-full snap-x snap-mandatory overflow-x-auto rounded-lg [scrollbar-width:none] focus-visible:ring-2 focus-visible:outline-none [&::-webkit-scrollbar]:hidden"
            >
                {learnCards.map((card, index) => (
                    <article
                        key={card.id}
                        aria-roledescription="slide"
                        aria-label={t('home.learn.position', { current: index + 1, total: learnCards.length })}
                        aria-hidden={index !== current}
                        style={dimStyle(card.dimension)}
                        className="bg-card w-full shrink-0 snap-start overflow-hidden rounded-lg border"
                    >
                        <div className="h-1.5 bg-[var(--dim)]" aria-hidden />
                        <div className="p-5 md:p-8">
                            <p className="text-sm font-medium text-[var(--dim)]">{tl(card.topic)}</p>
                            <h3 className="font-display mt-1 text-2xl leading-tight font-semibold md:text-3xl">{tl(card.title)}</h3>
                            <p className="text-muted-foreground mt-3 max-w-[70ch]">{tl(card.intro)}</p>

                            <ul className={cn('mt-6 grid gap-4 sm:grid-cols-2', card.points.length === 3 && 'lg:grid-cols-3')}>
                                {card.points.map((point) => (
                                    <li
                                        key={point.title.es}
                                        style={point.dimension ? dimStyle(point.dimension) : undefined}
                                        className="border-l-2 border-[var(--dim)] pl-4"
                                    >
                                        <p className="font-semibold">{tl(point.title)}</p>
                                        <p className="text-muted-foreground mt-1 text-sm">{tl(point.text)}</p>
                                    </li>
                                ))}
                            </ul>

                            {card.highlight && (
                                <div className="bg-muted mt-6 rounded-md p-4">
                                    <p className="text-sm font-semibold">{tl(card.highlight.label)}</p>
                                    <p className="mt-1 text-sm">{tl(card.highlight.text)}</p>
                                </div>
                            )}
                        </div>
                    </article>
                ))}
            </div>

            <div className="mt-4 flex justify-center gap-2">
                {learnCards.map((card, index) => (
                    <button
                        key={card.id}
                        type="button"
                        onClick={() => goTo(index)}
                        aria-label={tl(card.topic)}
                        aria-current={index === current}
                        style={dimStyle(card.dimension)}
                        className={cn(
                            'h-2.5 rounded-full transition-all',
                            index === current ? 'w-7 bg-[var(--dim)]' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50 w-2.5',
                        )}
                    />
                ))}
            </div>
        </section>
    );
}
