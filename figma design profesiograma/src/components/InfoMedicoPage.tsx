export function InfoMedicoPage() {
  return (
    <div className="page p-16">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl text-blue-900 mb-2">1. INFORMACIÓN DEL MÉDICO RESPONSABLE</h2>
          <div className="h-1 w-24 bg-blue-600 rounded"></div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-4">
                <label className="text-sm text-slate-600 uppercase tracking-wide">Nombre Completo</label>
                <p className="text-lg text-slate-900 mt-1">[Nombre del médico especialista]</p>
              </div>

              <div className="border-b border-slate-200 pb-4">
                <label className="text-sm text-slate-600 uppercase tracking-wide">Registro Médico</label>
                <p className="text-lg text-slate-900 mt-1">[Número de registro]</p>
              </div>

              <div className="border-b border-slate-200 pb-4">
                <label className="text-sm text-slate-600 uppercase tracking-wide">Especialidad</label>
                <p className="text-lg text-slate-900 mt-1">Medicina del Trabajo / Salud Ocupacional</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-4">
                <label className="text-sm text-slate-600 uppercase tracking-wide">Número de Licencia en SST</label>
                <p className="text-lg text-slate-900 mt-1">[Número de licencia vigente]</p>
              </div>

              <div className="border-b border-slate-200 pb-4">
                <label className="text-sm text-slate-600 uppercase tracking-wide">Fecha de Expedición Licencia</label>
                <p className="text-lg text-slate-900 mt-1">[DD/MM/AAAA]</p>
              </div>

              <div className="border-b border-slate-200 pb-4">
                <label className="text-sm text-slate-600 uppercase tracking-wide">Fecha</label>
                <p className="text-lg text-slate-900 mt-1">[DD/MM/AAAA]</p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-200">
            <label className="text-sm text-slate-600 uppercase tracking-wide">Firma</label>
            <div className="mt-4 h-24 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center">
              <span className="text-slate-400">___________________________________</span>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <p className="text-sm text-blue-900">
            <strong>Nota:</strong> Este protocolo ha sido elaborado por un médico especialista en Medicina del Trabajo 
            o Salud Ocupacional con licencia vigente en Seguridad y Salud en el Trabajo, en cumplimiento de la normatividad 
            colombiana vigente.
          </p>
        </div>
      </div>
    </div>
  );
}
