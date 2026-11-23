<?php

namespace App\Services;

use RuntimeException;

/**
 * Falha ao falar com o Gemini. O $reason é uma chave curta que o frontend traduz:
 * "quota" (limite gratuito atingido) ou "failed" (qualquer outro erro).
 * $retryable indica falha passageira, que vale tentar mais uma vez.
 */
class GeminiException extends RuntimeException
{
    public function __construct(public readonly string $reason, string $message = '', public readonly bool $retryable = false)
    {
        parent::__construct($message ?: $reason);
    }
}
