import { FileText, Shield, Clock } from 'lucide-react';

export function GestionResultadosPage() {
  return (
    <div className="page p-16">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl text-blue-900 mb-2">10. GESTIÓN DE RESULTADOS</h2>
          <div className="h-1 w-24 bg-blue-600 rounded"></div>
        </div>

        <div className="space-y-6">
          {/* Comunicación de resultados */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl text-blue-900">10.1. Comunicación de resultados</h3>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-600">
                <p className="text-slate-700">
                  <strong>Al trabajador:</strong> Se entrega resultado individual por escrito, con explicación de 
                  hallazgos, restricciones y recomendaciones. El trabajador firma recibido.
                </p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-600">
                <p className="text-slate-700">
                  <strong>Al empleador:</strong> Se comunican únicamente el concepto de aptitud y las 
                  restricciones/recomendaciones necesarias para adecuar el puesto de trabajo, sin revelar diagnósticos.
                </p>
              </div>
            </div>
          </div>

          {/* Manejo de hallazgos */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-amber-600" />
              <h3 className="text-xl text-blue-900">10.2. Manejo de hallazgos anormales</h3>
            </div>
            
            <p className="text-slate-700 mb-4">Cuando se detecten hallazgos clínicos o paraclínicos anormales:</p>
            
            <div className="grid grid-cols-2 gap-3">
              {[
                'Se informa al trabajador de manera inmediata',
                'Se emite remisión a EPS para manejo especializado',
                'Se establece restricción temporal hasta aclaración',
                'Se programa evaluación de seguimiento',
                'Se incluye en sistema de vigilancia epidemiológica',
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-slate-50 rounded">
                  <div className="w-6 h-6 bg-amber-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs">
                    {index + 1}
                  </div>
                  <span className="text-sm text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Restricciones */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 className="text-xl text-blue-900 mb-4">10.3. Restricciones y recomendaciones</h3>
            
            <p className="text-slate-700 mb-4">Toda restricción médico-laboral debe:</p>
            
            <ul className="space-y-2 text-slate-700 mb-6">
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>Estar claramente justificada desde lo clínico-ocupacional</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>Especificar si es temporal o permanente</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>Ser comunicada por escrito al trabajador y al empleador</span>
              </li>
            </ul>

            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-sm text-slate-600 mb-2"><strong>Ejemplos de restricciones comunes:</strong></p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  'No manipulación de cargas > X kg',
                  'No bipedestación prolongada',
                  'No exposición a ruido > X dB',
                  'Trabajo en horario diurno',
                  'Pausas adicionales',
                  'No trabajo en alturas',
                ].map((item, index) => (
                  <div key={index} className="p-2 bg-white border border-slate-200 rounded text-slate-700">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Custodia */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-purple-600" />
              <h3 className="text-xl text-blue-900">10.4. Custodia de información</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-slate-700">
                  Las historias clínicas se custodian bajo estricta confidencialidad
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-slate-700">
                  Conforme a la Ley 1581 de 2012 (Protección de datos personales)
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg col-span-2">
                <p className="text-slate-700">
                  <strong>Tiempo de conservación:</strong> 20 años después de terminada la relación laboral
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
