<?php

return [
    'required' => 'O campo :attribute é obrigatório.',
    'string' => 'O campo :attribute deve ser um texto.',
    'integer' => 'O campo :attribute deve ser um número inteiro.',
    'array' => 'O campo :attribute deve ser uma lista válida.',
    'in' => 'O valor de :attribute é inválido.',
    'exists' => 'O valor de :attribute não existe.',
    'unique' => 'O valor de :attribute já está cadastrado.',
    'email' => 'O campo :attribute deve ser um e-mail válido.',
    'confirmed' => 'A confirmação de :attribute não corresponde.',
    'current_password' => 'A senha está incorreta.',
    'lowercase' => 'O campo :attribute deve estar em letras minúsculas.',
    'date_format' => 'O campo :attribute deve ter o formato :format.',
    'between' => ['numeric' => 'O campo :attribute deve estar entre :min e :max.'],
    'min' => ['numeric' => 'O campo :attribute deve ser pelo menos :min.', 'string' => 'O campo :attribute deve ter pelo menos :min caracteres.'],
    'max' => ['numeric' => 'O campo :attribute não deve superar :max.', 'string' => 'O campo :attribute não deve superar :max caracteres.'],
    'attributes' => ['name' => 'nome', 'email' => 'e-mail', 'password' => 'senha', 'sector' => 'setor', 'size' => 'porte',
        'workers' => 'trabalhadores', 'region' => 'região', 'answers' => 'respostas', 'answers.*' => 'resposta',
        'recommendationId' => 'recomendação', 'owner' => 'responsável', 'dueDate' => 'prazo', 'indicator' => 'indicador', 'status' => 'status'],
];
