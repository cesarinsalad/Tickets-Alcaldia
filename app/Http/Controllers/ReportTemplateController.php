<?php

namespace App\Http\Controllers;

use App\Models\ReportTemplate;
use Illuminate\Http\Request;

class ReportTemplateController extends Controller
{
    public function store(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:100',
                'unique:report_templates,name,NULL,id,created_by,' . $user->id,
            ],
            'source' => 'required|in:tickets,equipments',
            'filters' => 'required|array',
            'filters.date_range_preset' => 'nullable|string|in:current_month,previous_month,last_7_days,last_30_days,last_90_days',
            'filters.date_from' => 'nullable|date',
            'filters.date_to' => 'nullable|date',
        ]);

        ReportTemplate::create([
            'name' => $validated['name'],
            'source' => $validated['source'],
            'filters' => $request->input('filters'),
            'created_by' => $user->id,
        ]);

        return back()->with('success', 'Plantilla guardada correctamente.');
    }

    public function update(Request $request, ReportTemplate $reportTemplate)
    {
        if (! $reportTemplate->isOwnedBy($request->user())) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:100',
                'unique:report_templates,name,' . $reportTemplate->id . ',id,created_by,' . $request->user()->id,
            ],
        ]);

        $reportTemplate->update($validated);

        return back()->with('success', 'Plantilla actualizada correctamente.');
    }

    public function destroy(Request $request, ReportTemplate $reportTemplate)
    {
        if (! $reportTemplate->isOwnedBy($request->user())) {
            abort(403);
        }

        $reportTemplate->delete();

        return back()->with('success', 'Plantilla eliminada correctamente.');
    }
}
