<?php

namespace Database\Seeders;

use App\Enums\ArticleStatus;
use App\Models\Article;
use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Seeder;

class ArticleSeeder extends Seeder
{
    public function run(): void
    {
        $this->command?->info('Creando artículos de la base de conocimiento...');

        $categories = Category::all();
        if ($categories->isEmpty()) {
            $this->command?->warn('No hay categorías. Saltando seeder de artículos.');
            return;
        }

        $techUsers = User::role('tecnico')->get();
        $adminUsers = User::role(['admin_tickets', 'super_admin'])->get();
        $authors = $techUsers->merge($adminUsers);

        $titles = [
            'Protocolo de instalación de impresoras en red',
            'Guía de resolución de problemas de conectividad VPN',
            'Configuración de cuentas de correo en Outlook',
            'Mantenimiento preventivo de equipos de cómputo',
            'Procedimiento para cambio de tóner en impresoras HP',
            'Solución de pantalla azul en Windows 11',
            'Cómo configurar el escaneo a correo en impresoras multifunción',
            'Guía de acceso remoto para teletrabajo',
            'Protocolo de respaldo de datos y recuperación',
            'Instalación y activación de software administrativo municipal',
            'Resolución de errores de licencia en sistemas municipales',
            'Configuración de extensiones telefónicas IP',
            'Guía para solicitud de nuevos equipos informáticos',
            'Procedimiento de baja de equipos obsoletos',
            'Protocolo de seguridad: cambio de contraseñas obligatorio',
            'Cómo reportar fallas de infraestructura eléctrica',
            'Instalación de puntos de red adicionales',
            'Configuración de firma digital en documentos oficiales',
            'Solución de errores comunes en el sistema de nómina',
            'Guía rápida de primeros auxilios informáticos',
        ];

        $created = 0;
        foreach ($titles as $title) {
            $author = $authors->random();
            $status = fake()->boolean(70) ? ArticleStatus::Published : ArticleStatus::Draft;

            $article = Article::create([
                'title' => $title,
                'content' => $this->generateContent($title),
                'author_id' => $author->id,
                'status' => $status,
            ]);

            $article->categories()->attach(
                $categories->random(fake()->numberBetween(1, 3))->pluck('id')->toArray()
            );

            $created++;
        }

        $this->command?->info("Artículos creados: {$created}");
    }

    private function generateContent(string $title): string
    {
        $steps = fake()->numberBetween(3, 6);
        $html = '<h2>' . $title . '</h2>';
        $html .= '<p>' . fake()->paragraph(3) . '</p>';

        for ($i = 1; $i <= $steps; $i++) {
            $html .= '<h3>Paso ' . $i . ': ' . fake()->sentence(3) . '</h3>';
            $html .= '<p>' . fake()->paragraph(2) . '</p>';
            if (fake()->boolean(40)) {
                $html .= '<blockquote><p><strong>Nota:</strong> ' . fake()->sentence() . '</p></blockquote>';
            }
        }

        $html .= '<h3>Recomendaciones finales</h3>';
        $html .= '<p>' . fake()->paragraph(2) . '</p>';

        return $html;
    }
}
