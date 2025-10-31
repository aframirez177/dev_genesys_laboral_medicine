import { Paperclip, FileText } from 'lucide-react';

export function AnexosPage() {
  const anexos = [
    { numero: 1, titulo: 'Perfiles de cargo detallados por área' },
    { numero: 2, titulo: 'Matriz de identificación de peligros, evaluación y valoración de riesgos' },
    { numero: 3, titulo: 'Estudios higiénicos (ruido, iluminación, etc.)' },
    { numero: 4, titulo: 'Formatos de evaluación médica ocupacional' },
    { numero: 5, titulo: 'Formato de concepto de aptitud' },
    { numero: 6, titulo: 'Formato de restricciones y recomendaciones médico-laborales' },
    { numero: 7, titulo: 'Consentimiento informado para evaluación médica ocupacional' },
    { numero: 8, titulo: 'Programas de vigilancia epidemiológica vigentes' },
  ];

  return (
    <div className="page p-16">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Anexos */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Paperclip className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-3xl text-blue-900">16. ANEXOS</h2>
              <div className="h-1 w-24 bg-blue-600 rounded mt-2"></div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="grid gap-3">
              {anexos.map((anexo) => (
                <div
                  key={anexo.numero}
                  className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-600">Anexo {anexo.numero}</p>
                    <p className="text-slate-900">{anexo.titulo}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Nota Importante */}
        <section>
          <div className="bg-gradient-to-r from-amber-50 to-amber-100 border-2 border-amber-300 rounded-lg p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xl">
                ⚠
              </div>
              <div className="flex-1">
                <h3 className="text-xl text-amber-900 mb-3">NOTA IMPORTANTE</h3>
                <p className="text-amber-900 leading-relaxed">
                  Este protocolo es un documento técnico-médico que complementa, pero no reemplaza, los perfiles 
                  de cargo y la matriz de riesgos elaborados por el empleador. Debe ser actualizado periódicamente 
                  y entregado a las IPS o médicos que realicen las evaluaciones médicas ocupacionales, junto con 
                  la información de los cargos específicos a evaluar.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer del documento */}
        <section className="border-t-2 border-slate-300 pt-6">
          <div className="text-center space-y-4">
            <div className="inline-block px-6 py-3 bg-blue-900 text-white rounded-lg">
              <p className="text-sm">Documento elaborado en cumplimiento de la</p>
              <p className="text-lg">Resolución 1843 de 2025</p>
              <p className="text-sm">Ministerio del Trabajo - República de Colombia</p>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-sm text-slate-600 mt-6">
              <div className="p-3 bg-slate-50 rounded">
                <p className="text-xs uppercase tracking-wide text-slate-500">Elaborado</p>
                <p className="text-slate-700 mt-1">[Fecha]</p>
              </div>
              <div className="p-3 bg-slate-50 rounded">
                <p className="text-xs uppercase tracking-wide text-slate-500">Revisado</p>
                <p className="text-slate-700 mt-1">[Fecha]</p>
              </div>
              <div className="p-3 bg-slate-50 rounded">
                <p className="text-xs uppercase tracking-wide text-slate-500">Aprobado</p>
                <p className="text-slate-700 mt-1">[Fecha]</p>
              </div>
            </div>

            <div className="text-xs text-slate-500 mt-6">
              Este documento es propiedad de [Nombre de la empresa] - Uso exclusivo interno
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
