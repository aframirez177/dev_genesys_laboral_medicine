import { FileEdit, CheckCircle } from 'lucide-react';

export function RevisionAprobacionPage() {
  return (
    <div className="page p-16">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Control de Cambios */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileEdit className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-3xl text-blue-900">14. CONTROL DE CAMBIOS</h2>
              <div className="h-1 w-24 bg-blue-600 rounded mt-2"></div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-100">
                <tr>
                  <th className="text-left p-4 text-slate-700">Versión</th>
                  <th className="text-left p-4 text-slate-700">Fecha</th>
                  <th className="text-left p-4 text-slate-700">Descripción del cambio</th>
                  <th className="text-left p-4 text-slate-700">Responsable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr className="bg-white">
                  <td className="p-4 text-slate-900">1.0</td>
                  <td className="p-4 text-slate-700">[DD/MM/AAAA]</td>
                  <td className="p-4 text-slate-700">Emisión inicial</td>
                  <td className="p-4 text-slate-700">[Nombre médico]</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-4 text-slate-400">-</td>
                  <td className="p-4 text-slate-400">-</td>
                  <td className="p-4 text-slate-400">-</td>
                  <td className="p-4 text-slate-400">-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Aprobación y Firmas */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-3xl text-blue-900">15. APROBACIÓN Y FIRMAS</h2>
              <div className="h-1 w-24 bg-blue-600 rounded mt-2"></div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Elaboró */}
            <div className="bg-white rounded-lg shadow-sm border-l-4 border-blue-600 p-6">
              <h3 className="text-lg text-blue-800 mb-4">Elaboró</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-sm text-slate-600 uppercase tracking-wide">Nombre</label>
                  <p className="text-slate-900 mt-1">[Nombre del médico especialista en SST]</p>
                </div>
                <div>
                  <label className="text-sm text-slate-600 uppercase tracking-wide">Cargo</label>
                  <p className="text-slate-900 mt-1">Médico Especialista en Salud Ocupacional</p>
                </div>
                <div>
                  <label className="text-sm text-slate-600 uppercase tracking-wide">Licencia SST N°</label>
                  <p className="text-slate-900 mt-1">[Número]</p>
                </div>
                <div>
                  <label className="text-sm text-slate-600 uppercase tracking-wide">Fecha</label>
                  <p className="text-slate-900 mt-1">[DD/MM/AAAA]</p>
                </div>
              </div>
              <div className="border-t border-slate-200 pt-4">
                <label className="text-sm text-slate-600 uppercase tracking-wide">Firma</label>
                <div className="mt-2 h-16 border-b-2 border-slate-300"></div>
              </div>
            </div>

            {/* Revisó */}
            <div className="bg-white rounded-lg shadow-sm border-l-4 border-amber-600 p-6">
              <h3 className="text-lg text-amber-800 mb-4">Revisó</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-sm text-slate-600 uppercase tracking-wide">Nombre</label>
                  <p className="text-slate-900 mt-1">[Responsable SG-SST de la empresa]</p>
                </div>
                <div>
                  <label className="text-sm text-slate-600 uppercase tracking-wide">Cargo</label>
                  <p className="text-slate-900 mt-1">[Cargo]</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm text-slate-600 uppercase tracking-wide">Fecha</label>
                  <p className="text-slate-900 mt-1">[DD/MM/AAAA]</p>
                </div>
              </div>
              <div className="border-t border-slate-200 pt-4">
                <label className="text-sm text-slate-600 uppercase tracking-wide">Firma</label>
                <div className="mt-2 h-16 border-b-2 border-slate-300"></div>
              </div>
            </div>

            {/* Aprobó */}
            <div className="bg-white rounded-lg shadow-sm border-l-4 border-green-600 p-6">
              <h3 className="text-lg text-green-800 mb-4">Aprobó</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-sm text-slate-600 uppercase tracking-wide">Nombre</label>
                  <p className="text-slate-900 mt-1">[Representante Legal o quien delegue]</p>
                </div>
                <div>
                  <label className="text-sm text-slate-600 uppercase tracking-wide">Cargo</label>
                  <p className="text-slate-900 mt-1">[Cargo]</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm text-slate-600 uppercase tracking-wide">Fecha</label>
                  <p className="text-slate-900 mt-1">[DD/MM/AAAA]</p>
                </div>
              </div>
              <div className="border-t border-slate-200 pt-4">
                <label className="text-sm text-slate-600 uppercase tracking-wide">Firma</label>
                <div className="mt-2 h-16 border-b-2 border-slate-300"></div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
