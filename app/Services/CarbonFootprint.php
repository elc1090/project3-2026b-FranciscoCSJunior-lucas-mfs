<?php

namespace App\Services;

use App\Models\CarbonRecord;

class CarbonFootprint
{
    /**
     * Fatores de emissão referenciais (kg CO2e por unidade), para uma estimativa simples.
     * Combustíveis: valores médios baseados nas diretrizes do IPCC.
     * Eletricidade: fator médio aproximado do Sistema Elétrico Nacional do Chile.
     * Não substituem um inventário de emissões oficial.
     */
    public const FACTORS = [
        'electricity_kwh' => 0.29,
        'natural_gas_m3' => 1.95,
        'lpg_kg' => 2.98,
        'diesel_l' => 2.68,
        'gasoline_l' => 2.31,
    ];

    /** Fontes exibidas nos gráficos e os campos que somam em cada uma. */
    public const SOURCES = [
        'electricity' => ['electricity_kwh'],
        'naturalGas' => ['natural_gas_m3'],
        'lpg' => ['lpg_kg'],
        'transport' => ['diesel_l', 'gasoline_l'],
    ];

    /** @return array{emissions: array<string, float>, total: float} em kg CO2e */
    public function calculate(CarbonRecord $record): array
    {
        $emissions = [];
        foreach (self::SOURCES as $source => $fields) {
            $emissions[$source] = round(array_sum(array_map(fn ($field) => $record->{$field} * self::FACTORS[$field], $fields)), 1);
        }

        return ['emissions' => $emissions, 'total' => round(array_sum($emissions), 1)];
    }
}
