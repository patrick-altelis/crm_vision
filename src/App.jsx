import React from 'react'
import EditableClientGrid from './components/EditableClientGrid'

function App() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">CRM BDD - Gestion des Clients</h1>
      <EditableClientGrid />
    </div>
  )
}

export default App