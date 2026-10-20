<?php

namespace App\Services;

use Illuminate\Support\Collection;

class DiagnosisScoring
{
    public const AREAS = ['environmental', 'workers', 'community', 'economic', 'governance'];

    public function calculate(Collection $questions, array $answers): array
    {
        $scored = $questions->whereNull('sector');
        $percent = fn (Collection $items) => $items->isEmpty() ? 0 : (int) round($items->sum(fn ($q) => $answers[$q->code] ?? 0) / ($items->count() * 3) * 100);
        $scores = [];
        foreach (self::AREAS as $area) {
            $scores[$area] = $percent($scored->where(in_array($area, ['workers', 'community']) ? 'group' : 'dimension', $area));
        }
        $dimensions = [];
        foreach (['environmental', 'social', 'economic', 'governance'] as $dimension) {
            $dimensions[$dimension] = $percent($scored->where('dimension', $dimension));
        }
        $priorities = [];
        foreach (self::AREAS as $area) {
            $dimension = in_array($area, ['workers', 'community']) ? 'social' : $area;
            $candidates = $questions->filter(fn ($q) => ($q->sector ? (! in_array($area, ['workers', 'community']) && $q->dimension === $dimension)
                    : (in_array($area, ['workers', 'community']) ? $q->group === $area : $q->dimension === $area))
                && ($answers[$q->code] ?? 0) <= 1
            )->sortBy(fn ($q) => $answers[$q->code] ?? 0);
            $recommendations = $candidates->map(fn ($q) => $q->recommendation?->code)->filter()->values()->all();
            if ($scores[$area] < 50 || count($recommendations)) {
                $priorities[] = ['area' => $area, 'score' => $scores[$area], 'recommendationIds' => $recommendations];
            }
        }
        usort($priorities, fn ($a, $b) => $a['score'] <=> $b['score']);

        return ['scores' => $scores, 'dimensionScores' => $dimensions, 'priorities' => $priorities,
            'totalScore' => ['points' => $scored->sum(fn ($q) => $answers[$q->code] ?? 0), 'max' => $scored->count() * 3, 'percent' => $percent($scored)]];
    }
}
