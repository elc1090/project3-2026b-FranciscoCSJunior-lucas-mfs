<?php

return [
    'required' => 'El campo :attribute es obligatorio.',
    'string' => 'El campo :attribute debe ser un texto.',
    'integer' => 'El campo :attribute debe ser un entero.',
    'array' => 'El campo :attribute debe ser una lista válida.',
    'in' => 'El valor de :attribute no es válido.',
    'exists' => 'El valor de :attribute no existe.',
    'unique' => 'El valor de :attribute ya está registrado.',
    'email' => 'El campo :attribute debe ser un correo válido.',
    'confirmed' => 'La confirmación de :attribute no coincide.',
    'current_password' => 'La contraseña no es correcta.',
    'lowercase' => 'El campo :attribute debe estar en minúsculas.',
    'date_format' => 'El campo :attribute debe tener el formato :format.',
    'between' => ['numeric' => 'El campo :attribute debe estar entre :min y :max.'],
    'min' => ['numeric' => 'El campo :attribute debe ser al menos :min.', 'string' => 'El campo :attribute debe tener al menos :min caracteres.'],
    'max' => ['numeric' => 'El campo :attribute no debe superar :max.', 'string' => 'El campo :attribute no debe superar :max caracteres.'],
    'attributes' => ['name' => 'nombre', 'email' => 'correo electrónico', 'password' => 'contraseña', 'sector' => 'sector',
        'size' => 'tamaño', 'workers' => 'trabajadores', 'region' => 'región', 'answers' => 'respuestas', 'answers.*' => 'respuesta',
        'recommendationId' => 'recomendación', 'owner' => 'responsable', 'dueDate' => 'fecha límite', 'indicator' => 'indicador', 'status' => 'estado'],
];
