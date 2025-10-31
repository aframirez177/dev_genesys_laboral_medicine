import { CheckCircle2, ArrowRight } from 'lucide-react';

export function MetodologiaPage() {
  const infoEntrada = [
    'Perfiles de cargo actualizados por área/departamento',
    'Matriz de identificación de peligros, evaluación y valoración de riesgos (IPER)',
    'Matriz de requisitos legales en SST',
    'Diagnóstico de condiciones de salud de los trabajadores',
    'Indicadores epidemiológicos de la empresa',
    'Estudios técnicos (higiénicos, ergonómicos, psicosociales)',
    'Investigaciones de accidentes e incidentes laborales',
    'Programas de vigilancia epidemiológica existentes',
  ];

  return (
    <div className="page p-16">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl text-blue-900 mb-2">6. METODOLOGÍA DE ELABORACIÓN DEL PROTOCOLO</h2>
          <div className="h-1 w-24 bg-blue-600 rounded"></div>
        </div>

        <p className="text-slate-700 mb-8 leading-relaxed">
          Este protocolo fue elaborado mediante un proceso técnico-médico sistemático que garantiza 
          la identificación adecuada de los exámenes médicos requeridos según las exposiciones ocupacionales:
        </p>

        <div className="space-y-8">
          {/* Paso 1 */}
          <div className="bg-white rounded-lg shadow-sm border-l-4 border-blue-600 p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-xl text-blue-900 mb-3">Análisis de información de entrada</h3>
                <p className="text-slate-700 mb-4">
                  El médico especialista en SST revisó y analizó la siguiente documentación suministrada 
                  por el empleador:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {infoEntrada.map((item, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-600">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Paso 2 */}
          <div className="bg-white rounded-lg shadow-sm border-l-4 border-green-600 p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-xl text-blue-900 mb-3">Identificación de exposiciones ocupacionales</h3>
                <p className="text-slate-700 mb-3">
                  Se identificaron y priorizaron los factores de riesgo presentes en los diferentes cargos:
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Físicos', 'Químicos', 'Biológicos', 'Biomecánicos', 'Psicosociales', 'Seguridad'].map((tipo) => (
                    <span key={tipo} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      {tipo}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Paso 3 */}
          <div className="bg-white rounded-lg shadow-sm border-l-4 border-amber-600 p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-amber-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-xl text-blue-900 mb-3">Correlación clínico-ocupacional</h3>
                <p className="text-slate-700">
                  Se estableció la relación entre las exposiciones laborales identificadas y los posibles 
                  efectos en la salud, considerando órganos afectados, tiempo de exposición, valores límite 
                  permisibles y evidencia científica disponible.
                </p>
              </div>
            </div>
          </div>

          {/* Paso 4 */}
          <div className="bg-white rounded-lg shadow-sm border-l-4 border-purple-600 p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
                4
              </div>
              <div className="flex-1">
                <h3 className="text-xl text-blue-900 mb-3">Selección de exámenes médicos ocupacionales</h3>
                <p className="text-slate-700">
                  Con base en el análisis anterior, se definieron los exámenes clínicos, paraclínicos y 
                  complementarios más apropiados para cada cargo o grupo de exposición similar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
