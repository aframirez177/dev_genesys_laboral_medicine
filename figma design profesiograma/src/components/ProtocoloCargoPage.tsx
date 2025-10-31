import { Briefcase, AlertTriangle } from 'lucide-react';

export function ProtocoloCargoPage() {
  const factoresRiesgo = [
    { factor: 'Biomecánico', descripcion: 'Postura prolongada de pie, movimientos repetitivos MMSS', exposicion: 'Alta', valoracion: 'Alto' },
    { factor: 'Físico - Ruido', descripcion: 'Exposición a 85 dB durante toda la jornada', exposicion: 'Media', valoracion: 'Medio' },
    { factor: 'Químico', descripcion: 'Exposición ocasional a vapores de solventes', exposicion: 'Baja', valoracion: 'Bajo' },
    { factor: 'Psicosocial', descripcion: 'Trabajo bajo presión, turnos rotativos', exposicion: 'Media', valoracion: 'Medio' },
  ];

  const examenesPreingreso = [
    { examen: 'Audiometría tonal', justificacion: 'Exposición a ruido ≥ 85 dB - Establecer línea de base auditiva' },
    { examen: 'Visiometría', justificacion: 'Trabajo que requiere agudeza visual para manejo de maquinaria' },
    { examen: 'Cuadro hemático completo', justificacion: 'Valoración del estado general de salud' },
    { examen: 'Glicemia basal', justificacion: 'Detección de diabetes mellitus' },
    { examen: 'Perfil lipídico', justificacion: 'Valoración de riesgo cardiovascular' },
    { examen: 'Evaluación osteomuscular', justificacion: 'Valoración por exposición biomecánica' },
  ];

  return (
    <div className="page p-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h2 className="text-3xl text-blue-900 mb-2">8. PROTOCOLO POR CARGO</h2>
          <div className="h-1 w-24 bg-blue-600 rounded"></div>
        </div>

        {/* Ficha del cargo */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg">
          <h3 className="text-xl">FICHA N°: 001</h3>
        </div>

        <div className="bg-white rounded-b-lg shadow-sm border border-slate-200 p-6 space-y-6">
          {/* Identificación */}
          <div>
            <h4 className="text-lg text-blue-800 mb-3 flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              8.1. IDENTIFICACIÓN DEL CARGO
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-slate-50 rounded">
                <span className="text-slate-600">Nombre del cargo:</span>
                <p className="text-slate-900">Operario de producción</p>
              </div>
              <div className="p-3 bg-slate-50 rounded">
                <span className="text-slate-600">Área/Departamento:</span>
                <p className="text-slate-900">Producción - Línea 1</p>
              </div>
              <div className="p-3 bg-slate-50 rounded">
                <span className="text-slate-600">Número de trabajadores:</span>
                <p className="text-slate-900">25</p>
              </div>
              <div className="p-3 bg-slate-50 rounded">
                <span className="text-slate-600">Nivel de riesgo ARL:</span>
                <p className="text-slate-900">III (Alto)</p>
              </div>
            </div>
          </div>

          {/* Factores de riesgo */}
          <div>
            <h4 className="text-lg text-blue-800 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              8.3. FACTORES DE RIESGO IDENTIFICADOS
            </h4>
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="text-left p-2">Factor de Riesgo</th>
                    <th className="text-left p-2">Descripción</th>
                    <th className="text-left p-2">Exposición</th>
                    <th className="text-left p-2">Valoración</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {factoresRiesgo.map((row, index) => (
                    <tr key={index} className="bg-white">
                      <td className="p-2 text-slate-900">{row.factor}</td>
                      <td className="p-2 text-slate-700">{row.descripcion}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          row.exposicion === 'Alta' ? 'bg-red-100 text-red-800' :
                          row.exposicion === 'Media' ? 'bg-amber-100 text-amber-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {row.exposicion}
                        </span>
                      </td>
                      <td className="p-2 text-slate-700">{row.valoracion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Exámenes de preingreso */}
          <div>
            <h4 className="text-lg text-blue-800 mb-3">A. EVALUACIÓN DE PREINGRESO</h4>
            <p className="text-sm text-slate-700 mb-3">
              <strong>Periodicidad:</strong> Anual (por nivel de riesgo alto)
            </p>
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="text-left p-2">Examen</th>
                    <th className="text-left p-2">Justificación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {examenesPreingreso.map((row, index) => (
                    <tr key={index} className="bg-white">
                      <td className="p-2 text-slate-900">{row.examen}</td>
                      <td className="p-2 text-slate-700">{row.justificacion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Concepto de aptitud */}
          <div className="grid grid-cols-4 gap-2 text-xs">
            {['Apto', 'Apto con restricciones', 'Aplazado', 'No apto'].map((concepto) => (
              <div key={concepto} className="p-2 border border-slate-300 rounded text-center text-slate-700">
                □ {concepto}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
