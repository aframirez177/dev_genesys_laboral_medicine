import { UserCog, Building2, Users } from 'lucide-react';

export function ResponsabilidadesPage() {
  return (
    <div className="page p-16">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl text-blue-900 mb-2">9. RESPONSABILIDADES</h2>
          <div className="h-1 w-24 bg-blue-600 rounded"></div>
        </div>

        <div className="space-y-6">
          {/* Médico Especialista */}
          <div className="bg-white rounded-lg shadow-sm border-l-4 border-blue-600 p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <UserCog className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl text-blue-900 mb-3">9.1. Del Médico Especialista en SST</h3>
                <ul className="space-y-2 text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 flex-shrink-0">•</span>
                    <span>Elaborar y actualizar el protocolo basándose en la información técnica del empleador</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 flex-shrink-0">•</span>
                    <span>Realizar las evaluaciones médicas ocupacionales conforme a este protocolo</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 flex-shrink-0">•</span>
                    <span>Emitir conceptos de aptitud fundamentados técnica y científicamente</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 flex-shrink-0">•</span>
                    <span>Establecer restricciones o recomendaciones médico-laborales cuando sea necesario</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 flex-shrink-0">•</span>
                    <span>Garantizar la confidencialidad de la información médica</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 flex-shrink-0">•</span>
                    <span>Realizar vigilancia epidemiológica y análisis de tendencias</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 flex-shrink-0">•</span>
                    <span>Revisar y actualizar el protocolo al menos una vez al año</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Empleador */}
          <div className="bg-white rounded-lg shadow-sm border-l-4 border-green-600 p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building2 className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl text-green-900 mb-3">9.2. Del Empleador</h3>
                <ul className="space-y-2 text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 flex-shrink-0">•</span>
                    <span>Suministrar información completa: perfiles de cargo, matriz de riesgos, estudios técnicos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 flex-shrink-0">•</span>
                    <span>Garantizar que las evaluaciones sean realizadas por médicos especialistas con licencia vigente</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 flex-shrink-0">•</span>
                    <span>Asumir el costo de las evaluaciones médicas y exámenes complementarios</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 flex-shrink-0">•</span>
                    <span>Programar las evaluaciones periódicas en horario laboral</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 flex-shrink-0">•</span>
                    <span>Implementar las restricciones y recomendaciones médicas en máximo 20 días hábiles</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 flex-shrink-0">•</span>
                    <span>Mantener archivo documental de las evaluaciones médicas</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Trabajador */}
          <div className="bg-white rounded-lg shadow-sm border-l-4 border-amber-600 p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl text-amber-900 mb-3">9.3. Del Trabajador</h3>
                <ul className="space-y-2 text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 flex-shrink-0">•</span>
                    <span>Asistir puntualmente a las evaluaciones médicas programadas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 flex-shrink-0">•</span>
                    <span>Suministrar información veraz y completa sobre su estado de salud</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 flex-shrink-0">•</span>
                    <span>Permitir la realización de los exámenes clínicos y paraclínicos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 flex-shrink-0">•</span>
                    <span>Acatar las restricciones y recomendaciones médico-laborales</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 flex-shrink-0">•</span>
                    <span>Informar oportunamente sobre cambios en su estado de salud</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 flex-shrink-0">•</span>
                    <span>Mantener hábitos de vida saludable y participar en programas de prevención</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
