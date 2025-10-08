"use client"

export default function ContestiPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Contesti di Conversazione</h1>
          <p className="text-gray-600">Gestisci i tuoi contesti salvati</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-8">
          <p className="text-gray-500 text-center py-8">Nessun contesto salvato ancora</p>
        </div>
      </div>
    </div>
  )
}
