<?php

namespace App\Exports;

use Illuminate\Contracts\Support\Responsable;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Events\AfterSheet;
use Maatwebsite\Excel\Excel;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ReportesExport implements FromCollection, WithHeadings, WithMapping, WithStyles, ShouldAutoSize, WithEvents, Responsable
{
    use Exportable;

    private string $fileName = 'reporte.xlsx';
    private string $writerType = Excel::XLSX;
    private array $headers = [
        'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    private int $columnCount;

    public function __construct(
        private Collection $rows,
        private array $columns,
        private string $source,
        private ?string $title = null,
        private ?string $groupBy = 'none',
    ) {
        $this->columnCount = max(count($this->columns), 1);

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
        $rowType = $row['_type'] ?? 'ticket';
        $emptyCells = array_fill(0, $this->columnCount, '');

        if ($rowType === 'group_header') {
            $label = $row['group_label'] ?? '—';
            $total = (int) ($row['group_total'] ?? 0);
            $emptyCells[0] = "▼ {$label} ({$total} ticket" . ($total === 1 ? '' : 's') . ')';
            return $emptyCells;
        }

        if ($rowType === 'subtotal') {
            $label = $row['group_label'] ?? '—';
            $total = (int) ($row['total'] ?? 0);
            $itemLabel = $this->source === 'tickets' ? 'ticket' : 'equipo';
            $parts = ["Subtotal {$label}: {$total} {$itemLabel}" . ($total === 1 ? '' : 's')];
            if ($this->source === 'tickets') {
                if (! empty($row['on_time'])) $parts[] = "{$row['on_time']} a tiempo";
                if (! empty($row['overdue'])) $parts[] = "{$row['overdue']} vencidos";
                if (! empty($row['pending'])) $parts[] = "{$row['pending']} pendientes";
            } else {
                if (! empty($row['interventions'])) $parts[] = "{$row['interventions']} intervenciones";
            }
            $emptyCells[0] = implode(' | ', $parts);
            return $emptyCells;
        }

        if ($rowType === 'group_spacer') {
            return $emptyCells;
        }

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
        $lastCol = $this->columnCount;
        $colLetter = Coordinate::stringFromColumnIndex($lastCol);

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

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();
                $lastCol = $this->columnCount;
                $colLetter = Coordinate::stringFromColumnIndex($lastCol);
                $rowIndex = 2;

                foreach ($this->rows as $row) {
                    $type = $row['_type'] ?? 'ticket';
                    $range = "A{$rowIndex}:{$colLetter}{$rowIndex}";

                    if ($type === 'group_header') {
                        $sheet->getStyle($range)->applyFromArray([
                            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 10],
                            'fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => '1E3A5F']],
                            'alignment' => ['horizontal' => 'left', 'vertical' => 'center'],
                        ]);
                    } elseif ($type === 'subtotal') {
                        $sheet->getStyle($range)->applyFromArray([
                            'font' => ['italic' => true, 'color' => ['rgb' => '475569'], 'size' => 9],
                            'fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => 'F1F5F9']],
                            'alignment' => ['horizontal' => 'left', 'vertical' => 'center'],
                        ]);
                    } elseif ($type === 'group_spacer') {
                        $sheet->getRowDimension($rowIndex)->setRowHeight(6);
                    }

                    $rowIndex++;
                }
            },
        ];
    }
}
