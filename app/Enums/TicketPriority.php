<?php

namespace App\Enums;

enum TicketPriority: string
{
    case SinDefinir = 'sin_definir';
    case Baja = 'baja';
    case Media = 'media';
    case Alta = 'alta';
    case Critica = 'critica';

    public function label(): string
    {
        return match ($this) {
            self::SinDefinir => 'Sin definir',
            self::Baja => 'Baja',
            self::Media => 'Media',
            self::Alta => 'Alta',
            self::Critica => 'Crítica',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::SinDefinir => 'gray',
            self::Baja => 'gray',
            self::Media => 'yellow',
            self::Alta => 'orange',
            self::Critica => 'red',
        };
    }

    public function slaHours(): int
    {
        return match ($this) {
            self::SinDefinir => 0,
            self::Baja => 72,
            self::Media => 24,
            self::Alta => 4,
            self::Critica => 1,
        };
    }

    public function responseMinutes(): int
    {
        return match ($this) {
            self::SinDefinir => 0,
            self::Baja => 480,
            self::Media => 240,
            self::Alta => 60,
            self::Critica => 30,
        };
    }

    public function description(): string
    {
        return match ($this) {
            self::SinDefinir => 'Pendiente de clasificación por el administrador.',
            self::Baja => 'Duda general o solicitud de insumos.',
            self::Media => 'Un equipo falla, pero hay alternativas temporales.',
            self::Alta => 'No puedo realizar mis tareas principales.',
            self::Critica => 'Todo un departamento o sistema vital está paralizado.',
        };
    }
}
