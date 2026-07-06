<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class TicketsExport implements FromCollection, WithHeadings, WithStyles, ShouldAutoSize, WithEvents
{
    use Exportable;

    public function __construct(
        private Collection $rows,
    ) {}

    public function collection(): Collection
    {
        return $this->rows;
    }

    public function headings(): array
    {
        return [
            'Código',
            'Título',
            'Solicitante',
            'Departamento',
            'Prioridad',
            'Estado',
            'Categoría',
            'Asignado',
            'Ingreso',
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        return [
            1 => [
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 10],
                'fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => '1E3A5F']],
                'alignment' => ['horizontal' => 'left', 'vertical' => 'center'],
            ],
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();
                $rowCount = $this->rows->count() + 1;
                $lastCol = 'I';

                $sheet->getRowDimension(1)->setRowHeight(22);

                for ($i = 2; $i <= $rowCount; $i++) {
                    $range = "A{$i}:{$lastCol}{$i}";
                    $sheet->getStyle($range)->applyFromArray([
                        'font' => ['size' => 10, 'color' => ['rgb' => '334155']],
                        'borders' => [
                            'bottom' => [
                                'borderStyle' => 'thin',
                                'color' => ['rgb' => 'E2E8F0'],
                            ],
                        ],
                    ]);
                }
            },
        ];
    }
}
