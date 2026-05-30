<?php

namespace App\Enums;

enum TicketPriority: string
{
    case Baja = 'baja';
    case Media = 'media';
    case Alta = 'alta';
    case Critica = 'critica';

    public function label(): string
    {
        return match ($this) {
            self::Baja => 'Baja',
            self::Media => 'Media',
            self::Alta => 'Alta',
            self::Critica => 'Crítica',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::Baja => 'gray',
            self::Media => 'yellow',
            self::Alta => 'orange',
            self::Critica => 'red',
        };
    }

    public function slaHours(): int
    {
        return match ($this) {
            self::Baja => 72,
            self::Media => 24,
            self::Alta => 4,
            self::Critica => 1,
        };
    }

    public function description(): string
    {
        return match ($this) {
            self::Baja => 'Duda general o solicitud de insumos.',
            self::Media => 'Un equipo falla, pero hay alternativas temporales.',
            self::Alta => 'No puedo realizar mis tareas principales.',
            self::Critica => 'Todo un departamento o sistema vital está paralizado.',
        };
    }
}
