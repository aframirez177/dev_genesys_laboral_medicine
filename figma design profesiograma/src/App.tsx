import { useState } from 'react';
import { ChevronLeft, ChevronRight, Printer, FileDown } from 'lucide-react';
import { Button } from './components/ui/button';
import { PortadaPage } from './components/PortadaPage';
import { InfoMedicoPage } from './components/InfoMedicoPage';
import { ObjetoAlcancePage } from './components/ObjetoAlcancePage';
import { MarcoNormativoPage } from './components/MarcoNormativoPage';
import { DefinicionesPage } from './components/DefinicionesPage';
import { MetodologiaPage } from './components/MetodologiaPage';
import { CriteriosGeneralesPage } from './components/CriteriosGeneralesPage';
import { ProtocoloCargoPage } from './components/ProtocoloCargoPage';
import { ResponsabilidadesPage } from './components/ResponsabilidadesPage';
import { GestionResultadosPage } from './components/GestionResultadosPage';
import { DiagnosticoIndicadoresPage } from './components/DiagnosticoIndicadoresPage';
import { RevisionAprobacionPage } from './components/RevisionAprobacionPage';
import { AnexosPage } from './components/AnexosPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState(0);

  const pages = [
    { component: <PortadaPage />, title: 'Portada' },
    { component: <InfoMedicoPage />, title: 'Información del Médico' },
    { component: <ObjetoAlcancePage />, title: 'Objeto y Alcance' },
    { component: <MarcoNormativoPage />, title: 'Marco Normativo y Definiciones' },
    { component: <DefinicionesPage />, title: 'Definiciones Complementarias' },
    { component: <MetodologiaPage />, title: 'Metodología de Elaboración' },
    { component: <CriteriosGeneralesPage />, title: 'Criterios Generales' },
    { component: <ProtocoloCargoPage />, title: 'Protocolo por Cargo - Ficha 001' },
    { component: <ResponsabilidadesPage />, title: 'Responsabilidades' },
    { component: <GestionResultadosPage />, title: 'Gestión de Resultados' },
    { component: <DiagnosticoIndicadoresPage />, title: 'Diagnóstico e Indicadores' },
    { component: <RevisionAprobacionPage />, title: 'Revisión y Aprobación' },
    { component: <AnexosPage />, title: 'Anexos' },
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    alert('Para exportar a PDF, use la función de impresión del navegador y seleccione "Guardar como PDF"');
  };

  const nextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const previousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Navigation Bar - Hidden when printing */}
      <div className="print:hidden sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-slate-800">Protocolo de Vigilancia - SST</h1>
            <span className="text-slate-500 text-sm">
              Página {currentPage + 1} de {pages.length}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button onClick={handlePrint} variant="outline" size="sm">
              <Printer className="w-4 h-4 mr-2" />
              Imprimir
            </Button>
            <Button onClick={handleExport} variant="outline" size="sm">
              <FileDown className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="page-container">
        {pages[currentPage].component}
      </div>

      {/* Page Navigation - Hidden when printing */}
      <div className="print:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg">
        <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Button
            onClick={previousPage}
            disabled={currentPage === 0}
            variant="outline"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>

          <div className="flex items-center gap-2">
            {pages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentPage
                    ? 'bg-blue-600 w-8'
                    : 'bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label={`Ir a página ${index + 1}`}
              />
            ))}
          </div>

          <Button
            onClick={nextPage}
            disabled={currentPage === pages.length - 1}
            variant="outline"
          >
            Siguiente
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
