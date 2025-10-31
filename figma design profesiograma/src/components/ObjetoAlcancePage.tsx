import { Target, Users } from 'lucide-react';

export function ObjetoAlcancePage() {
  return (
    <div className="page p-16">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Objeto */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-3xl text-blue-900">2. OBJETO DEL DOCUMENTO</h2>
              <div className="h-1 w-24 bg-blue-600 rounded mt-2"></div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
            <p className="text-slate-700 leading-relaxed">
              Establecer los lineamientos técnico-médicos para la práctica de evaluaciones médicas ocupacionales 
              de los trabajadores de <strong>[Nombre de la empresa]</strong>, definiendo los exámenes clínicos, 
              paraclínicos y complementarios requeridos según el perfil de cargo, la exposición a factores de 
              riesgo laboral y las condiciones de salud individuales, en cumplimiento de la <strong>Resolución 
              1843 de 2025 del Ministerio del Trabajo</strong> y demás normatividad vigente en materia de 
              Seguridad y Salud en el Trabajo.
            </p>
          </div>
        </section>

        {/* Alcance */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-3xl text-blue-900">3. ALCANCE</h2>
              <div className="h-1 w-24 bg-blue-600 rounded mt-2"></div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
            <p className="text-slate-700 leading-relaxed mb-6">
              Este protocolo aplica a todos los trabajadores de la organización, independientemente de su tipo 
              de vinculación laboral (directos, contratistas, temporales, aprendices), y contempla las siguientes 
              modalidades de evaluaciones médicas ocupacionales:
            </p>

            <div className="grid grid-cols-2 gap-4">
              {[
                'Evaluaciones médicas de preingreso',
                'Evaluaciones médicas periódicas (programadas o por cambio de ocupación)',
                'Evaluaciones médicas de egreso',
                'Evaluaciones médicas de retorno laboral (ausencias no médicas ≥ 90 días)',
                'Evaluaciones médicas post-incapacidad (incapacidad ≥ 30 días o antes si procede)',
                'Evaluaciones médicas de seguimiento y control',
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm">
                    {index + 1}
                  </div>
                  <span className="text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
