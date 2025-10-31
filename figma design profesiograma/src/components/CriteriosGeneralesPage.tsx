export function CriteriosGeneralesPage() {
  return (
    <div className="page p-16">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl text-blue-900 mb-2">7. CRITERIOS GENERALES PARA TODAS LAS EVALUACIONES</h2>
          <div className="h-1 w-24 bg-blue-600 rounded"></div>
        </div>

        <div className="space-y-8">
          {/* Evaluación básica */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 className="text-xl text-blue-800 mb-4">7.1. Evaluación médica básica (aplica a todos los cargos)</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="text-blue-900 mb-2">A. Historia clínica ocupacional completa</h4>
                <ul className="text-sm text-slate-700 space-y-1 ml-4">
                  <li>• Anamnesis: antecedentes personales, familiares, ocupacionales</li>
                  <li>• Revisión por sistemas</li>
                  <li>• Hábitos (tabaquismo, alcoholismo, actividad física)</li>
                  <li>• Historia ocupacional detallada</li>
                </ul>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="text-green-900 mb-2">B. Examen físico completo por sistemas</h4>
                <ul className="text-sm text-slate-700 space-y-1 ml-4">
                  <li>• Signos vitales completos</li>
                  <li>• Evaluación de todos los sistemas</li>
                  <li>• Evaluación sensorial (agudeza visual y auditiva)</li>
                  <li>• Estado mental</li>
                </ul>
              </div>

              <div className="p-4 bg-amber-50 rounded-lg">
                <h4 className="text-amber-900 mb-2">C. Medidas antropométricas</h4>
                <ul className="text-sm text-slate-700 space-y-1 ml-4">
                  <li>• Peso, Talla, IMC</li>
                  <li>• Perímetro abdominal</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Periodicidad */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 className="text-xl text-blue-800 mb-4">7.2. Criterios de periodicidad</h3>
            <p className="text-slate-700 mb-4">
              La periodicidad de las evaluaciones médicas periódicas se establece según el nivel de riesgo del cargo:
            </p>

            <div className="overflow-hidden rounded-lg border border-slate-200">
              <table className="w-full">
                <thead className="bg-blue-900 text-white">
                  <tr>
                    <th className="text-left p-3">Nivel de Riesgo</th>
                    <th className="text-left p-3">Periodicidad Máxima</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {[
                    { nivel: 'Riesgo I (bajo)', periodicidad: 'Cada 3 años' },
                    { nivel: 'Riesgo II (medio)', periodicidad: 'Cada 2 años' },
                    { nivel: 'Riesgo III (alto)', periodicidad: 'Cada año' },
                    { nivel: 'Riesgo IV (muy alto)', periodicidad: 'Cada 6-12 meses' },
                    { nivel: 'Riesgo V (crítico)', periodicidad: 'Semestral o según necesidad médica' },
                  ].map((row, index) => (
                    <tr key={index} className="bg-white hover:bg-slate-50">
                      <td className="p-3 text-slate-700">{row.nivel}</td>
                      <td className="p-3 text-slate-900">{row.periodicidad}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-900">
                <strong>Nota:</strong> La periodicidad específica para cada cargo se define en la Sección 8 de este protocolo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
