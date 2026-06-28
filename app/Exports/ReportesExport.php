<?php

namespace App\Exports;

use Illuminate\Contracts\Support\Responsable;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Excel;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ReportesExport implements FromCollection, WithHeadings, WithMapping, WithStyles, ShouldAutoSize, Responsable
{
    private string $fileName = 'reporte.xlsx';
    private string $writerType = Excel::XLSX;
    private array $headers = [
        'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    public function __construct(
        private Collection $rows,
        private array $columns,
        private string $source,
        private ?string $title = null,
    ) {
        $sourceLabels = [
            'tickets' => 'tickets',
            'equipments' => 'equipos',
            'users' => 'usuarios',
            'categories' => 'categorias',
            'departments' => 'departamentos',
        ];

        $label = $sourceLabels[$source] ?? $source;
        $this->fileName = "reporte-{$label}-" . now()->format('Ymd-His') . '.xlsx';
    }

    public function collection(): Collection
    {
        return $this->rows;
    }

    public function headings(): array
    {
        return array_map(fn ($col) => $col['label'], $this->columns);
    }

    public function map($row): array
    {
        return array_map(function ($col) use ($row) {
            $key = $col['key'];
            $format = $col['format'] ?? null;
            $value = data_get($row, $key, '—');

            if ($value === null || $value === '') {
                return '—';
            }

            if ($format === 'badge') {
                return $value;
            }

            if ($format === 'boolean') {
                return $value ? 'Sí' : 'No';
            }

            if ($format === 'datetime' && $value) {
                return $value instanceof \DateTimeInterface
                    ? $value->format('d/m/Y H:i')
                    : $value;
            }

            return $value;
        }, array_values($this->columns));
    }

    public function styles(Worksheet $sheet)
    {
        $lastCol = count($this->columns);
        $colLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($lastCol);

        return [
            1 => [
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 10],
                'fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => '1E3A5F']],
                'alignment' => ['horizontal' => 'left', 'vertical' => 'center'],
            ],
            "A1:{$colLetter}1" => [
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 10],
                'fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => '1E3A5F']],
            ],
        ];
    }
}
