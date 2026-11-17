<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;

/**
 * Cliente mínimo da Interactions API do Gemini (Google AI Studio).
 * A chave fica só no servidor; o navegador nunca a recebe.
 */
class GeminiClient
{
    public function enabled(): bool
    {
        return filled(config('services.gemini.key'));
    }

    /**
     * Envia o pedido e devolve a resposta já convertida de JSON, seguindo o $schema.
     */
    public function generateJson(string $systemInstruction, string $input, array $schema): array
    {
        try {
            $response = Http::baseUrl(config('services.gemini.url'))
                ->withHeaders(['x-goog-api-key' => config('services.gemini.key'), 'Api-Revision' => '2026-05-20'])
                ->acceptJson()
                ->timeout(60)
                ->post('interactions', [
                    'model' => config('services.gemini.model'),
                    'system_instruction' => $systemInstruction,
                    'input' => $input,
                    'response_format' => ['type' => 'text', 'mime_type' => 'application/json', 'schema' => $schema],
                    'generation_config' => ['max_output_tokens' => 4096],
                    // Não guardar a conversa nos servidores do Google.
                    'store' => false,
                ]);
        } catch (ConnectionException $e) {
            throw new GeminiException('failed', $e->getMessage());
        }

        if ($response->status() === 429) {
            throw new GeminiException('quota', $response->body());
        }
        if ($response->failed() || $response->json('status') !== 'completed') {
            throw new GeminiException('failed', 'Gemini '.$response->status().': '.$response->body());
        }

        $text = collect($response->json('steps', []))
            ->where('type', 'model_output')
            ->flatMap(fn ($step) => $step['content'] ?? [])
            ->where('type', 'text')
            ->pluck('text')
            ->implode('');
        $data = json_decode($text, true);
        if (! is_array($data)) {
            throw new GeminiException('failed', 'Gemini returned invalid JSON: '.$text);
        }

        return $data;
    }
}
