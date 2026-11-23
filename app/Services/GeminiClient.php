<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Sleep;

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
     * Falhas passageiras (Gemini sobrecarregado, resposta cortada) são tentadas mais uma vez.
     */
    public function generateJson(string $systemInstruction, string $input, array $schema): array
    {
        for ($attempt = 1; ; $attempt++) {
            try {
                return $this->attempt($systemInstruction, $input, $schema);
            } catch (GeminiException $e) {
                if (! $e->retryable || $attempt >= 2) {
                    throw $e;
                }
                Sleep::for(2)->seconds();
            }
        }
    }

    private function attempt(string $systemInstruction, string $input, array $schema): array
    {
        try {
            $response = Http::baseUrl(config('services.gemini.url'))
                ->withHeaders(['x-goog-api-key' => config('services.gemini.key'), 'Api-Revision' => '2026-05-20'])
                ->acceptJson()
                ->timeout(45)
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
            throw new GeminiException('failed', $e->getMessage(), retryable: true);
        }

        if ($response->status() === 429) {
            throw new GeminiException('quota', $response->body());
        }
        if ($response->failed() || $response->json('status') !== 'completed') {
            // Erros 4xx (chave, pedido inválido) não melhoram tentando de novo; 5xx e respostas incompletas, sim.
            throw new GeminiException('failed', 'Gemini '.$response->status().': '.$response->body(), retryable: ! $response->clientError());
        }

        $text = collect($response->json('steps', []))
            ->where('type', 'model_output')
            ->flatMap(fn ($step) => $step['content'] ?? [])
            ->where('type', 'text')
            ->pluck('text')
            ->implode('');
        $data = json_decode($text, true);
        if (! is_array($data)) {
            throw new GeminiException('failed', 'Gemini returned invalid JSON: '.$text, retryable: true);
        }

        return $data;
    }
}
