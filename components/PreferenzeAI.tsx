import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SupabaseUserProfileManager, AITool, UserPreferences } from "@/lib/supabaseUserProfile"
import { PlusIcon, TrashIcon } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface PreferenzeAIProps {
  onClose: () => void
}

const PreferenzeAI: React.FC<PreferenzeAIProps> = ({ onClose }) => {
  const [aiTools, setAiTools] = useState<AITool[]>([])
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newToolName, setNewToolName] = useState("")
  const [newToolType, setNewToolType] = useState<AITool["tipo"]>("chat")
  const [newToolPlan, setNewToolPlan] = useState<AITool["piano"]>("free")
  const [newCustomTaskType, setNewCustomTaskType] = useState("")

  const { toast } = useToast()

  const fetchPreferencesAndTools = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const authSuccess = await SupabaseUserProfileManager.ensureAuthenticated()
      if (!authSuccess) {
        throw new Error("Autenticazione fallita. Riprova.")
      }

      // Fetch preferences from the new API route
      const preferencesResponse = await fetch("/api/user/preferences/get-or-create")
      if (!preferencesResponse.ok) {
        const errorData = await preferencesResponse.json()
        throw new Error(errorData.message || "Errore nel caricamento/creazione preferenze")
      }
      const fetchedPreferences: UserPreferences = await preferencesResponse.json()
      setPreferences(fetchedPreferences)

      const fetchedTools = await SupabaseUserProfileManager.getAITools()
      setAiTools(fetchedTools)

    } catch (err: any) {
      console.error("Errore nel caricamento delle preferenze o strumenti:", err)
      setError(err.message || "Errore nel caricamento delle preferenze")
      toast({
        title: "Errore",
        description: err.message || "Errore nel caricamento delle preferenze.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchPreferencesAndTools()
  }, [fetchPreferencesAndTools])

  const handleUpdateToolStatus = async (toolId: string, isActive: boolean) => {
    try {
      await SupabaseUserProfileManager.updateAITool(toolId, { attivo: isActive })
      setAiTools(prev => prev.map(tool => tool.id === toolId ? { ...tool, attivo: isActive } : tool))
      toast({
        title: "Successo",
        description: `Stato di ${aiTools.find(t => t.id === toolId)?.nome} aggiornato.`, 
      })
    } catch (err: any) {
      toast({
        title: "Errore",
        description: err.message || "Impossibile aggiornare lo stato dello strumento.",
        variant: "destructive",
      })
    }
  }

  const handleAddTool = async () => {
    if (!newToolName.trim()) return
    try {
      const newTool = await SupabaseUserProfileManager.addAITool({
        nome: newToolName,
        tipo: newToolType,
        piano: newToolPlan,
        attivo: true,
      })
      if (newTool) {
        setAiTools(prev => [...prev, newTool])
        setNewToolName("")
        setNewToolType("chat")
        setNewToolPlan("free")
        toast({
          title: "Successo",
          description: `${newTool.nome} aggiunto ai tuoi strumenti AI.`, 
        })
      }
    } catch (err: any) {
      toast({
        title: "Errore",
        description: err.message || "Impossibile aggiungere lo strumento AI.",
        variant: "destructive",
      })
    }
  }

  const handleRemoveTool = async (toolId: string) => {
    try {
      await SupabaseUserProfileManager.removeAITool(toolId)
      setAiTools(prev => prev.filter(tool => tool.id !== toolId))
      toast({
        title: "Successo",
        description: `Strumento AI rimosso.`, 
      })
    } catch (err: any) {
      toast({
        title: "Errore",
        description: err.message || "Impossibile rimuovere lo strumento AI.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateAiPreference = async (taskType: string, aiName: string) => {
    if (!preferences) return
    const updatedAiPreferito = { ...preferences.aiPreferito, [taskType]: aiName }
    try {
      await SupabaseUserProfileManager.updateUserPreferences({ aiPreferito: updatedAiPreferito })
      setPreferences(prev => prev ? { ...prev, aiPreferito: updatedAiPreferito } : null)
      toast({
        title: "Successo",
        description: `Preferenza AI per ${taskType} aggiornata.`, 
      })
    } catch (err: any) {
      toast({
        title: "Errore",
        description: err.message || "Impossibile aggiornare la preferenza AI.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateBudget = async (field: keyof UserPreferences["budget"], value: any) => {
    if (!preferences) return
    const updatedBudget = { ...preferences.budget, [field]: value }
    try {
      await SupabaseUserProfileManager.updateUserPreferences({ budget: updatedBudget })
      setPreferences(prev => prev ? { ...prev, budget: updatedBudget } : null)
      toast({
        title: "Successo",
        description: `Budget aggiornato.`, 
      })
    } catch (err: any) {
      toast({
        title: "Errore",
        description: err.message || "Impossibile aggiornare il budget.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateNotification = async (field: keyof UserPreferences["notifiche"], value: boolean) => {
    if (!preferences) return
    const updatedNotifiche = { ...preferences.notifiche, [field]: value }
    try {
      await SupabaseUserProfileManager.updateUserPreferences({ notifiche: updatedNotifiche })
      setPreferences(prev => prev ? { ...prev, notifiche: updatedNotifiche } : null)
      toast({
        title: "Successo",
        description: `Notifiche aggiornate.`, 
      })
    } catch (err: any) {
      toast({
        title: "Errore",
        description: err.message || "Impossibile aggiornare le notifiche.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateTheme = async (theme: UserPreferences["tema"]) => {
    if (!preferences) return
    try {
      await SupabaseUserProfileManager.updateUserPreferences({ tema: theme })
      setPreferences(prev => prev ? { ...prev, tema: theme } : null)
      toast({
        title: "Successo",
        description: `Tema aggiornato a ${theme}.`, 
      })
    } catch (err: any) {
      toast({
        title: "Errore",
        description: err.message || "Impossibile aggiornare il tema.",
        variant: "destructive",
      })
    }
  }

  const handleAddCustomTaskType = async () => {
    if (!newCustomTaskType.trim() || !preferences) return
    const formattedType = newCustomTaskType.trim().toLowerCase().replace(/\s+/g, "-")
    if (preferences.aiPreferito[formattedType]) {
      toast({
        title: "Attenzione",
        description: "Questo tipo di task esiste già.",
        variant: "warning",
      })
      return
    }
    const updatedAiPreferito = { ...preferences.aiPreferito, [formattedType]: "ChatGPT-4" } // Default to ChatGPT-4
    try {
      await SupabaseUserProfileManager.updateUserPreferences({ aiPreferito: updatedAiPreferito })
      setPreferences(prev => prev ? { ...prev, aiPreferito: updatedAiPreferito } : null)
      setNewCustomTaskType("")
      toast({
        title: "Successo",
        description: `Tipo di task '${newCustomTaskType}' aggiunto.`, 
      })
    } catch (err: any) {
      toast({
        title: "Errore",
        description: err.message || "Impossibile aggiungere il tipo di task personalizzato.",
        variant: "destructive",
      })
    }
  }

  const handleRemoveCustomTaskType = async (taskType: string) => {
    if (!preferences || taskType === "generico") return // Prevent removing 'generico'
    const updatedAiPreferito = { ...preferences.aiPreferito }
    delete updatedAiPreferito[taskType]
    try {
      await SupabaseUserProfileManager.updateUserPreferences({ aiPreferito: updatedAiPreferito })
      setPreferences(prev => prev ? { ...prev, aiPreferito: updatedAiPreferito } : null)
      toast({
        title: "Successo",
        description: `Tipo di task '${taskType}' rimosso.`, 
      })
    } catch (err: any) {
      toast({
        title: "Errore",
        description: err.message || "Impossibile rimuovere il tipo di task.",
        variant: "destructive",
      })
    }
  }

  const aiToolOptions = SupabaseUserProfileManager.getAvailableAIOptions(aiTools)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Caricamento preferenze...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-500">
        <p>{error}</p>
        <Button onClick={fetchPreferencesAndTools} className="mt-4">Riprova</Button>
      </div>
    )
  }

  if (!preferences) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p>Nessuna preferenza trovata. Creazione in corso...</p>
        <Button onClick={fetchPreferencesAndTools} className="mt-4">Riprova</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Preferenze AI</h1>
      <p className="text-gray-600">Gestisci i tuoi strumenti AI e personalizza le impostazioni.</p>

      <Card>
        <CardHeader>
          <CardTitle>I Miei Strumenti AI</CardTitle>
          <CardDescription>Aggiungi, attiva o disattiva gli strumenti AI che utilizzi.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {aiTools.length === 0 && <p>Nessuno strumento AI configurato.</p>}
            {aiTools.map(tool => (
              <div key={tool.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`h-3 w-3 rounded-full ${tool.attivo ? "bg-green-500" : "bg-red-500"}`} />
                  <Label>{tool.nome} ({tool.piano.toUpperCase()})</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={tool.attivo}
                    onCheckedChange={(checked) => handleUpdateToolStatus(tool.id, checked)}
                  />
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveTool(tool.id)}>
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <div className="flex space-x-2 mt-4">
              <Input
                placeholder="Nome nuovo strumento AI"
                value={newToolName}
                onChange={(e) => setNewToolName(e.target.value)}
              />
              <Select value={newToolType} onValueChange={(value: AITool["tipo"]) => setNewToolType(value)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chat">Chat</SelectItem>
                  <SelectItem value="coding">Coding</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="analysis">Analysis</SelectItem>
                </SelectContent>
              </Select>
              <Select value={newToolPlan} onValueChange={(value: AITool["piano"]) => setNewToolPlan(value)}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Piano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="plus">Plus</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleAddTool}>
                <PlusIcon className="h-4 w-4 mr-2" /> Aggiungi
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Preferiti per Tipo di Task</CardTitle>
          <CardDescription>Scegli quale AI utilizzare per specifici tipi di task.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(preferences.aiPreferito).map(([taskType, aiName]) => (
              <div key={taskType} className="flex items-center justify-between">
                <Label className="capitalize">{taskType.replace(/-/g, " ")}</Label>
                <div className="flex items-center space-x-2">
                  <Select value={aiName} onValueChange={(value) => handleUpdateAiPreference(taskType, value)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Seleziona AI" />
                    </SelectTrigger>
                    <SelectContent>
                      {aiToolOptions.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {taskType !== "generico" && (
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveCustomTaskType(taskType)}>
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            <div className="flex space-x-2 mt-4">
              <Input
                placeholder="Aggiungi nuovo tipo di task (es. 'Traduzione')"
                value={newCustomTaskType}
                onChange={(e) => setNewCustomTaskType(e.target.value)}
              />
              <Button onClick={handleAddCustomTaskType}>
                <PlusIcon className="h-4 w-4 mr-2" /> Aggiungi Tipo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Budget</CardTitle>
          <CardDescription>Imposta il tuo budget mensile per gli strumenti AI.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="monthly-budget">Budget Mensile (€)</Label>
              <Input
                id="monthly-budget"
                type="number"
                value={preferences.budget.mensile}
                onChange={(e) => handleUpdateBudget("mensile", parseFloat(e.target.value))}
                className="w-[100px]"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="new-tool-available">Disponibile per nuovi strumenti AI</Label>
              <Switch
                id="new-tool-available"
                checked={preferences.budget.disponibileNuoviTool}
                onCheckedChange={(checked) => handleUpdateBudget("disponibileNuoviTool", checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifiche e Tema</CardTitle>
          <CardDescription>Gestisci le preferenze di notifica e il tema dell'interfaccia.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="personalized-suggestions">Suggerimenti personalizzati</Label>
              <Switch
                id="personalized-suggestions"
                checked={preferences.notifiche.suggerimenti}
                onCheckedChange={(checked) => handleUpdateNotification("suggerimenti", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="new-features">Nuove funzionalità</Label>
              <Switch
                id="new-features"
                checked={preferences.notifiche.nuoveFunzionalita}
                onCheckedChange={(checked) => handleUpdateNotification("nuoveFunzionalita", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Tema</Label>
              <Select value={preferences.tema} onValueChange={(value: UserPreferences["tema"]) => handleUpdateTheme(value)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Tema" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="auto">Auto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PreferenzeAI

