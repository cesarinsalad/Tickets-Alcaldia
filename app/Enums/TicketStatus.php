<?php

namespace App\Enums;

enum TicketStatus: string
{
    case Abierto = 'abierto';
    case EnProceso = 'en_proceso';
    case PendienteInformacion = 'pendiente_informacion';
    case Resuelto = 'resuelto';
    case Cerrado = 'cerrado';

    public function label(): string
    {
        return match ($this) {
            self::Abierto => 'Abierto',
            self::EnProceso => 'En Proceso',
            self::PendienteInformacion => 'Pendiente de Información',
            self::Resuelto => 'Resuelto',
            self::Cerrado => 'Cerrado',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::Abierto => 'blue',
            self::EnProceso => 'orange',
            self::PendienteInformacion => 'yellow',
            self::Resuelto => 'green',
            self::Cerrado => 'gray',
        };
    }

    public static function allowedTransitions(): array
    {
        return [
            self::Abierto->value => [
                self::EnProceso->value,
                self::PendienteInformacion->value,
            ],
            self::EnProceso->value => [
                self::PendienteInformacion->value,
                self::Resuelto->value,
            ],
            self::PendienteInformacion->value => [
                self::EnProceso->value,
            ],
            self::Resuelto->value => [
                self::Cerrado->value,
            ],
            self::Cerrado->value => [
                self::Abierto->value,
            ],
        ];
    }
}
