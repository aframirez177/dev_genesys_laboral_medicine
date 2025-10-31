import { Activity, TrendingUp } from 'lucide-react';

export function DiagnosticoIndicadoresPage() {
  const indicadores = [
    {
      nombre: 'Cobertura de evaluaciones de ingreso',
      formula: '(N° evaluaciones ingreso realizadas / N° ingresos) x 100',
      meta: '100%',
      periodicidad: 'Mensual'
    },
    {
      nombre: 'Cobertura de evaluaciones periódicas',
      formula: '(N° evaluaciones periódicas realizadas / N° programadas) x 100',
      meta: '≥95%',
      periodicidad: 'Trimestral'
    },
    {
      nombre: 'Cobertura de evaluaciones de egreso',
      formula: '(N° evaluaciones egreso realizadas / N° egresos) x 100',
      meta: '≥90%',
      periodicidad: 'Mensual'
    },
    {
      nombre: 'Oportunidad implementación restricciones',
      formula: '(N° restricciones implementadas ≤20 días / Total restricciones) x 100',
      meta: '100%',
      periodicidad: 'Mensual'
    },
    {
      nombre: 'Hallazgos relacionados con trabajo',
      formula: '(N° casos relacionados con trabajo / Total evaluados) x 100',
      meta: 'Vigilancia',
      periodicidad: 'Semestral'
    },
  ];

  return (
    <div className="page p-16">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Diagnóstico General */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-3xl text-blue-900">11. DIAGNÓSTICO GENERAL DE SALUD</h2>
              <div className="h-1 w-24 bg-blue-600 rounded mt-2"></div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <p className="text-slate-700 mb-4">
              El médico especialista consolidará anualmente un diagnóstico general de salud de la población 
              trabajadora, que incluirá:
            </p>

            <div className="grid grid-cols-2 gap-3">
              {[
                'Características demográficas de la población',
                'Prevalencia de condiciones de salud',
                'Perfil de morbilidad ocupacional',
                'Ausentismo por causa médica',
                'Tendencias y análisis de indicadores',
                'Recomendaciones para programas de prevención',
                'Necesidades de vigilancia epidemiológica',
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-slate-700">{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-900">
                <strong>Confidencialidad:</strong> Este documento se entregará sin identificar casos individuales, 
                respetando la confidencialidad de la información médica.
              </p>
            </div>
          </div>
        </section>

        {/* Indicadores de Gestión */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-3xl text-blue-900">12. INDICADORES DE GESTIÓN DEL PROTOCOLO</h2>
              <div className="h-1 w-24 bg-blue-600 rounded mt-2"></div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-blue-900 text-white">
                  <tr>
                    <th className="text-left p-3">Indicador</th>
                    <th className="text-left p-3">Fórmula</th>
                    <th className="text-left p-3">Meta</th>
                    <th className="text-left p-3">Periodicidad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {indicadores.map((ind, index) => (
                    <tr key={index} className="hover:bg-slate-50">
                      <td className="p-3 text-slate-900">{ind.nombre}</td>
                      <td className="p-3 text-slate-600 text-xs">{ind.formula}</td>
                      <td className="p-3">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                          {ind.meta}
                        </span>
                      </td>
                      <td className="p-3 text-slate-700">{ind.periodicidad}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Revisión y Actualización */}
        <section>
          <div className="mb-4">
            <h2 className="text-2xl text-blue-900">13. REVISIÓN Y ACTUALIZACIÓN</h2>
            <div className="h-1 w-24 bg-blue-600 rounded mt-2"></div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <p className="text-slate-700 mb-4">Este protocolo debe revisarse y actualizarse en los siguientes casos:</p>
            
            <ul className="space-y-2 text-slate-700">
              {[
                'Cambios en la normatividad vigente',
                'Creación de nuevos cargos o modificación de existentes',
                'Cambios en la matriz de identificación de peligros',
                'Nuevas exposiciones ocupacionales',
                'Cambios en los procesos productivos',
                'Al menos una vez al año (revisión ordinaria)',
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-600 flex-shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-4 p-4 bg-slate-50 rounded">
              <p className="text-slate-700">
                <strong>Próxima revisión programada:</strong> [DD/MM/AAAA]
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
