import { BookOpen, FileText } from 'lucide-react';

export function MarcoNormativoPage() {
  const normas = [
    'Resolución 1843 de 2025 - Ministerio del Trabajo',
    'Decreto 1072 de 2015 (Libro 2, Parte 2, Título 4, Capítulo 6)',
    'Resolución 0312 de 2019 - Estándares mínimos del SG-SST',
    'Decisión 584 de 2004 - Comunidad Andina de Naciones',
    'Ley 1562 de 2012 - Sistema General de Riesgos Laborales',
    'Guías de Atención Integral en Salud Ocupacional (GATISO) vigentes',
  ];

  return (
    <div className="page p-16">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Marco Normativo */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-3xl text-blue-900">4. MARCO NORMATIVO</h2>
              <div className="h-1 w-24 bg-blue-600 rounded mt-2"></div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
            <div className="grid gap-3">
              {normas.map((norma, index) => (
                <div key={index} className="flex items-center gap-3 p-4 border-l-4 border-blue-600 bg-slate-50">
                  <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span className="text-slate-700">{norma}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Definiciones Principales */}
        <section>
          <div className="mb-6">
            <h2 className="text-3xl text-blue-900 mb-2">5. DEFINICIONES</h2>
            <div className="h-1 w-24 bg-blue-600 rounded"></div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg text-blue-800 mb-2">Evaluación médica ocupacional</h3>
              <p className="text-slate-700 leading-relaxed">
                Valoración clínica realizada por médico especialista en medicina del trabajo o salud ocupacional 
                con licencia vigente, para determinar las condiciones de salud física, mental y social del trabajador 
                en relación con los factores de riesgo a los que está expuesto.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg text-blue-800 mb-2">Perfil de cargo</h3>
              <p className="text-slate-700 leading-relaxed">
                Documento que describe de manera detallada las funciones, requisitos físicos, mentales, aptitudes, 
                competencias, riesgos asociados y condiciones específicas del puesto de trabajo.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg text-blue-800 mb-2">Restricción médico-laboral</h3>
              <p className="text-slate-700 leading-relaxed">
                Limitación temporal o permanente emitida por médico especialista, fundamentada en una evaluación 
                médica ocupacional, que busca proteger la salud del trabajador.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
