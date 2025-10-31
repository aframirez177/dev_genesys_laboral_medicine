export function PortadaPage() {
  return (
    <div className="page bg-gradient-to-br from-blue-900 to-blue-700 text-white flex flex-col items-center justify-center p-16">
      <div className="max-w-4xl text-center space-y-8">
        <div className="space-y-4">
          <div className="inline-block px-6 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-4">
            <span className="text-sm uppercase tracking-wider">Sistema de Gestión SST</span>
          </div>
          
          <h1 className="text-5xl leading-tight">
            PROTOCOLO DE VIGILANCIA DE LA SALUD OCUPACIONAL POR CARGO
          </h1>
        </div>

        <div className="h-px bg-white/30 w-3/4 mx-auto"></div>

        <div className="grid grid-cols-2 gap-8 text-left bg-white/5 backdrop-blur-sm p-8 rounded-lg border border-white/10">
          <div className="space-y-3">
            <div>
              <p className="text-sm text-blue-200 uppercase tracking-wide">Empresa</p>
              <p className="text-lg">[Nombre de la empresa]</p>
            </div>
            <div>
              <p className="text-sm text-blue-200 uppercase tracking-wide">NIT</p>
              <p className="text-lg">[Número de identificación tributaria]</p>
            </div>
            <div>
              <p className="text-sm text-blue-200 uppercase tracking-wide">Versión</p>
              <p className="text-lg">[Número de versión]</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm text-blue-200 uppercase tracking-wide">Fecha de Elaboración</p>
              <p className="text-lg">[DD/MM/AAAA]</p>
            </div>
            <div>
              <p className="text-sm text-blue-200 uppercase tracking-wide">Fecha de Vigencia</p>
              <p className="text-lg">[DD/MM/AAAA]</p>
            </div>
            <div>
              <p className="text-sm text-blue-200 uppercase tracking-wide">Próxima Revisión</p>
              <p className="text-lg">[DD/MM/AAAA]</p>
            </div>
          </div>
        </div>

        <div className="text-sm text-blue-200 mt-12">
          Documento elaborado en cumplimiento de la Resolución 1843 de 2025 del Ministerio del Trabajo
        </div>
      </div>
    </div>
  );
}
