"use client"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Dashboard AI Intelligente
          </h1>
          <p className="text-xl text-gray-600">
            Il tuo maestro d&apos;orchestra per progetti, AI e automazioni
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Cosa vuoi fare oggi?</h2>
          <textarea 
            className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none"
            placeholder="Descrivi il tuo progetto o obiettivo..."
          />
          <div className="flex gap-4 mt-4">
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              Analizza e Suggerisci
            </button>
            <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
              Crea Progetto Diretto
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Progetti</h3>
            <p className="text-gray-600 mb-4">Gestisci i tuoi progetti attivi</p>
            <div className="text-sm text-gray-500">2 progetti attivi</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Spazi AI</h3>
            <p className="text-gray-600 mb-4">I tuoi spazi AI specializzati</p>
            <div className="text-sm text-gray-500">6 spazi configurati</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Computer</h3>
            <p className="text-gray-600 mb-4">Gestione computer e risorse</p>
            <div className="text-sm text-gray-500">3 computer disponibili</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Automazioni</h3>
            <p className="text-gray-600 mb-4">Workflow e automazioni attive</p>
            <div className="text-sm text-gray-500">Presto disponibile</div>
          </div>
        </div>
      </div>
    </div>
  )
}
