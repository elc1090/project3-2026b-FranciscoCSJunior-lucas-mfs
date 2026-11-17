<?php

namespace App\Services;

use RuntimeException;

/**
 * Falha ao falar com o Gemini. O $reason é uma chave curta que o frontend traduz:
 * "quota" (limite gratuito atingido) ou "failed" (qualquer outro erro).
 */
class GeminiException extends RuntimeException
{
    public function __construct(public readonly string $reason, string $message = '')
    {
        parent::__construct($message ?: $reason);
    }
}
