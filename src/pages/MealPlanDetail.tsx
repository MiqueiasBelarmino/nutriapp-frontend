
import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { usePatients } from '@/hooks/usePatients'
import { useMealPlans } from '@/hooks/useMealPlans'
import { FoodAutocomplete } from '@/components/FoodAutocomplete'
import { ArrowLeft, Utensils, Edit3, Save, X, Calendar, User, FileText, Clock, Plus, Trash2, ChevronDown, ChevronUp, Apple, List, UtensilsCrossed } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { MealPlan } from '@/types/meal-plan.interface'
import { Meal } from '@/types/meal.interface'
import { MealItem } from '@/types/meal-item.interface'

interface Substitute {
  id: string
  name: string
  foodId?: string
  quantity: string
  observation?: string
}

interface LocalMealItem {
  id: string
  name: string
  foodId?: string
  quantity: string
  observation?: string
  substitutes: Substitute[]
}

interface LocalMeal {
  id: string
  name: string
  items: LocalMealItem[]
}

const MealPlanDetail: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { patients, fetchPatients } = usePatients()
  const { mealPlans, fetchMealPlans, updateMealPlan } = useMealPlans()

  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [meals, setMeals] = useState<LocalMeal[]>([])
  const [openMeals, setOpenMeals] = useState<Record<string, boolean>>({})

  const [formData, setFormData] = useState({
    patientId: '',
    date: '',
    notes: ''
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchPatients(), fetchMealPlans(id)])
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [fetchPatients, fetchMealPlans])

  useEffect(() => {
    if (id && mealPlans.length > 0) {
      const foundMealPlan = mealPlans.find(mp => mp.id === id)
      if (foundMealPlan) {
        setMealPlan(foundMealPlan)
        console.log(foundMealPlan)
        
        // Initialize meals state from mealPlan data
        const initialMeals: LocalMeal[] = (foundMealPlan.Meal || []).map(meal => ({
          id: meal.id,
          name: meal.name,
          items: (meal.items || []).map(item => ({
            id: item.id,
            name: item.food?.name || '',
            foodId: item.foodId,
            quantity: item.quantity || '',
            observation: item.observation || '',
            substitutes: item.substitutes?.map(sub => ({
              id: sub.id,
              name: sub.food?.name || '',
              foodId: sub.foodId,
              quantity: sub.quantity || '',
              observation: sub.observation || ''
            })) || []
          }))
        }))
        
        setMeals(initialMeals)
        
        // Initialize formData
        setFormData({
          patientId: foundMealPlan.patientId,
          date: foundMealPlan.date.split('T')[0],
          notes: foundMealPlan.notes || ''
        })
      }
    }
  }, [id, mealPlans])

  const handleSave = async () => {
    if (!mealPlan || !formData.patientId) {
      return
    }

    setSaving(true)
    try {
      // Map meals to the format expected by the backend
      const mappedContent = meals.map(meal => ({
        name: meal.name,
        items: meal.items.map(item => ({
          id: item.foodId, // Backend expects 'id' which will be used as 'foodId'
          name: item.name, // Send name so backend can create food if id is missing
          quantity: item.quantity,
          observation: item.observation,
          substitutes: item.substitutes?.map(sub => ({
            id: sub.foodId, // Backend expects 'id' which will be used as 'foodId'
            name: sub.name, // Send name so backend can create food if id is missing
            quantity: sub.quantity,
            observation: sub.observation
          })) || []
        }))
      }))

      await updateMealPlan(mealPlan.id, {
        patientId: formData.patientId,
        date: new Date(formData.date).toISOString(),
        content: mappedContent as any,
        notes: formData.notes || undefined
      })

      // O updateMealPlan já chama fetchMealPlans() internamente no hook
      // Então só precisamos trocar o estado do modo de edição
      setIsEditing(false)
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar: ' + (error instanceof Error ? error.message : String(error)))
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (mealPlan) {
      // Reset meals to original data
      const initialMeals: LocalMeal[] = mealPlan.Meal.map(meal => ({
        id: meal.id,
        name: meal.name,
        items: meal.items.map(item => ({
          id: item.id,
          name: item.food?.name || '',
          foodId: item.foodId,
          quantity: item.quantity || '',
          observation: item.observation || '',
          substitutes: item.substitutes?.map(sub => ({
            id: sub.id,
            name: sub.food?.name || '',
            foodId: sub.foodId,
            quantity: sub.quantity || '',
            observation: sub.observation || ''
          })) || []
        }))
      }))
      
      setMeals(initialMeals)
      
      // Reset formData
      setFormData({
        patientId: mealPlan.patientId,
        date: mealPlan.date.split('T')[0],
        notes: mealPlan.notes || ''
      })
    }
    setIsEditing(false)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSelectChange = (field: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Meal management functions
  const addMeal = () => {
    const newMeal: LocalMeal = {
      id: Date.now().toString(),
      name: "",
      items: []
    }
    setMeals([...meals, newMeal])
    setOpenMeals({ ...openMeals, [newMeal.id]: true })
  }

  const updateMealName = (mealId: string, name: string) => {
    setMeals(prev => prev.map(meal =>
      meal.id === mealId ? { ...meal, name } : meal
    ))
  }

  const removeMeal = (mealId: string) => {
    setMeals(meals.filter(meal => meal.id !== mealId))
    const newOpenMeals = { ...openMeals }
    delete newOpenMeals[mealId]
    setOpenMeals(newOpenMeals)
  }

  const toggleMeal = (mealId: string) => {
    setOpenMeals({ ...openMeals, [mealId]: !openMeals[mealId] })
  }

  // Item management functions
  const addItem = (mealId: string) => {
    const newItem: LocalMealItem = {
      id: Date.now().toString(),
      name: "",
      quantity: "",
      observation: "",
      substitutes: []
    }
    setMeals(prev => prev.map(meal =>
      meal.id === mealId
        ? { ...meal, items: [...meal.items, newItem] }
        : meal
    ))
  }

  const removeItem = (mealId: string, itemId: string) => {
    setMeals(prev => prev.map(meal =>
      meal.id === mealId
        ? { ...meal, items: meal.items.filter(item => item.id !== itemId) }
        : meal
    ))
  }

  const updateItem = (mealId: string, itemId: string, field: string, value: string) => {
    setMeals(prev => prev.map(meal =>
      meal.id === mealId
        ? {
          ...meal,
          items: meal.items.map(item =>
            item.id === itemId ? { ...item, [field]: value } : item
          )
        }
        : meal
    ))
  }

  // Substitute management functions
  const addSubstitute = (mealId: string, itemId: string) => {
    const newSubstitute: Substitute = {
      id: Date.now().toString(),
      name: "",
      quantity: "",
      observation: ""
    }
    setMeals(prev => prev.map(meal =>
      meal.id === mealId
        ? {
          ...meal,
          items: meal.items.map(item =>
            item.id === itemId
              ? { ...item, substitutes: [...item.substitutes, newSubstitute] }
              : item
          )
        }
        : meal
    ))
  }

  const removeSubstitute = (mealId: string, itemId: string, substituteId: string) => {
    setMeals(prev => prev.map(meal =>
      meal.id === mealId
        ? {
          ...meal,
          items: meal.items.map(item =>
            item.id === itemId
              ? {
                ...item,
                substitutes: item.substitutes.filter(sub => sub.id !== substituteId)
              }
              : item
          )
        }
        : meal
    ))
  }

  const updateSubstitute = (mealId: string, itemId: string, substituteId: string, field: string, value: string) => {
    setMeals(prev => prev.map(meal =>
      meal.id === mealId
        ? {
          ...meal,
          items: meal.items.map(item =>
            item.id === itemId
              ? {
                ...item,
                substitutes: item.substitutes.map(sub =>
                  sub.id === substituteId ? { ...sub, [field]: value } : sub
                )
              }
              : item
          )
        }
        : meal
    ))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando plano alimentar...</p>
        </div>
      </div>
    )
  }

  if (!mealPlan) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <Utensils className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Plano não encontrado</h2>
          <p className="text-gray-600 mb-6">O plano alimentar solicitado não foi encontrado.</p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    )
  }

  const patient = patients.find(p => p.id === mealPlan.patientId)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'Editar Plano Alimentar' : 'Detalhes do Plano Alimentar'}
            </h1>
            <p className="text-gray-600 mt-2">
              {isEditing ? 'Modifique as informações do plano' : 'Visualize e gerencie o plano alimentar'}
            </p>
          </div>
        </div>

        <div className="flex space-x-2">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <Edit3 className="h-4 w-4 mr-2" />
              Editar
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || !formData.patientId}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Patient Info Card */}
      {patient && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Informações do Paciente</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nome</p>
                <p className="font-medium">{patient.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{patient.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Telefone</p>
                <p className="font-medium">{patient.phone}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plan Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Utensils className="h-5 w-5" />
            <span>Informações do Plano</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isEditing ? (
            // View Mode
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Data do Plano</p>
                    <p className="font-medium">
                      {format(new Date(mealPlan.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                  </div>
                </div>

                {/* <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Calorias Totais</p>
                    <Badge variant="secondary" className="text-lg px-3 py-1">
                      {mealPlan.calories} kcal
                    </Badge>
                  </div>
                </div> */}
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Criado em</p>
                    <p className="font-medium">
                      {format(new Date(mealPlan.createdAt ?? ''), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </div>

                {mealPlan.updatedAt !== mealPlan.createdAt && (
                  <div className="flex items-center space-x-2">
                    <Edit3 className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Última atualização</p>
                      <p className="font-medium">
                        {format(new Date(mealPlan.updatedAt ?? ''), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Edit Mode
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="patientId">Paciente *</Label>
                <Select
                  value={formData.patientId}
                  onValueChange={handleSelectChange('patientId')}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Data do Plano *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  required
                />
              </div>

              {/* <div className="space-y-2 md:col-span-2">
                <Label htmlFor="calories">Calorias Totais *</Label>
                <Input
                  id="calories"
                  type="number"
                  min="0"
                  value={formData.calories}
                  onChange={(e) => handleInputChange('calories', e.target.value)}
                  placeholder="Ex: 2000"
                  className="max-w-xs"
                  required
                />
              </div> */}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plan Content */}
      <Card>
        <CardHeader>
          {/* <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Conteúdo</span>
          </CardTitle> */}
        </CardHeader>
        <CardContent>
          {!isEditing ? (
            <div className="">
              {mealPlan.Meal.map((meal, index) => (

                <Card className='mb-6' key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <span>{meal.name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="">
                      {meal.items.map((item) => (
                        <div key={item.id}>
                          <p
                             className="font-bold mt-2 pl-4 relative before:content-['•'] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2"
                          >
                            {item.quantity} {item.food?.name || 'Alimento não especificado'}
                          </p>

                          {item.observation && (
                            <p className="text-sm text-gray-600 pl-4 mb-1">
                               Obs: {item.observation}
                            </p>
                          )}

                          {/* iterate Substitutes array to display in single line, separated by commas */}
                          {item.substitutes && item.substitutes.length > 0 && (
                            <div className="pl-4 mt-1">
                                <p className="text-gray-500 italic text-sm font-medium mb-1">Substitutos:</p>
                                <ul className="list-disc list-inside text-sm text-gray-500">
                                    {item.substitutes.map(sub => (
                                        <li key={sub.id}>
                                            {sub.quantity} {sub.food?.name || 'Alimento não especificado'}
                                            {sub.observation && <span className="text-gray-400"> ({sub.observation})</span>}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                          )}
                        </div>
                      ))}

                    </div>
                  </CardContent>
                </Card>


              ))}
            </div>
          ) : (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <List className="w-5 h-5" />
                    Refeições
                  </CardTitle>
                  <Button
                    type="button"
                    onClick={addMeal}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Refeição
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {meals.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <UtensilsCrossed className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p>Nenhuma refeição adicionada ainda.</p>
                    <p className="text-sm">Clique em "Adicionar Refeição" para começar.</p>
                  </div>
                ) : (
                  meals.map((meal: LocalMeal, mealIndex) => (
                    <Collapsible
                      key={meal.id}
                      open={openMeals[meal.id]}
                      onOpenChange={() => toggleMeal(meal.id)}
                    >
                      <Card className="border border-slate-200">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <span className="text-blue-600 font-semibold text-sm">
                                  {mealIndex + 1}
                                </span>
                              </div>
                              <Input
                                value={meal.name}
                                onChange={(e) => updateMealName(meal.id, e.target.value)}
                                placeholder="Nome da refeição (ex: Café da Manhã)"
                                className="font-medium border-0 focus:ring-0 text-lg"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeMeal(meal.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                              <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  {openMeals[meal.id] ? (
                                    <ChevronUp className="w-4 h-4" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4" />
                                  )}
                                </Button>
                              </CollapsibleTrigger>
                            </div>
                          </div>
                        </CardHeader>
                        <CollapsibleContent>
                          <CardContent className="space-y-4">
                            {/* Items */}
                            <div className="space-y-3">
                              {meal.items.map((item: LocalMealItem, itemIndex: number) => (
                                <div key={item.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                                  <div className="flex items-start gap-3 mb-3">
                                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-2">
                                      <Apple className="w-3 h-3 text-green-600" />
                                    </div>
                                    <div className="flex-1 space-y-3">
                                      <div className="grid md:grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                          <Label className="text-xs text-slate-600">
                                            Item Alimentar *
                                          </Label>
                                          <FoodAutocomplete
                                            value={item.name}
                                            selectedId={item.foodId}
                                            onChange={(name, id) => {
                                              updateItem(meal.id, item.id, "name", name)
                                              updateItem(meal.id, item.id, "foodId", id || '')
                                            }}
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <Label className="text-xs text-slate-600">
                                            Quantidade
                                          </Label>
                                          <Input
                                            value={item.quantity}
                                            onChange={(e) => updateItem(meal.id, item.id, 'quantity', e.target.value)}
                                            placeholder="Ex: 4 colheres de sopa"
                                            className="h-10"
                                          />
                                        </div>
                                      </div>
                                      <div className="space-y-1">
                                        <Label className="text-xs text-slate-600">
                                          Observação (Opcional)
                                        </Label>
                                        <Input
                                          value={item.observation || ''}
                                          onChange={(e) => updateItem(meal.id, item.id, 'observation', e.target.value)}
                                          placeholder="Ex: Cozido, sem sal, marca X..."
                                          className="h-10"
                                        />
                                      </div>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => removeItem(meal.id, item.id)}
                                      className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>

                                  {/* Substitutes */}
                                  {item.substitutes.length > 0 && (
                                    <div className="ml-9 space-y-2 mb-3">
                                      <Label className="text-xs text-slate-500 font-medium">
                                        Substitutos:
                                      </Label>
                                      {item.substitutes.map((substitute: Substitute) => (
                                        <div key={substitute.id} className="flex items-start gap-2 bg-white p-2 rounded border border-slate-200">
                                          <div className="flex-1 space-y-2">
                                            <div className="grid md:grid-cols-2 gap-2">
                                              <FoodAutocomplete
                                                value={substitute.name}
                                                selectedId={substitute.foodId}
                                                onChange={(name, id) => {
                                                  updateSubstitute(meal.id, item.id, substitute.id, "name", name)
                                                  updateSubstitute(meal.id, item.id, substitute.id, "foodId", id || '')
                                                }}
                                              />
                                              <Input
                                                value={substitute.quantity}
                                                onChange={(e) => updateSubstitute(meal.id, item.id, substitute.id, 'quantity', e.target.value)}
                                                className="h-10 text-sm"
                                                placeholder="Quantidade"
                                              />
                                            </div>
                                            <Input
                                              value={substitute.observation}
                                              onChange={(e) => updateSubstitute(meal.id, item.id, substitute.id, 'observation', e.target.value)}
                                              className="h-10 text-sm w-full"
                                              placeholder="Observação (Opcional)"
                                            />
                                          </div>

                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeSubstitute(meal.id, item.id, substitute.id)}
                                            className="h-10 w-10 text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addSubstitute(meal.id, item.id)}
                                    className="ml-9 h-8 text-xs"
                                  >
                                    <Plus className="w-3 h-3 mr-1" />
                                    Adicionar Substituto
                                  </Button>
                                </div>
                              ))}
                            </div>

                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => addItem(meal.id)}
                              className="w-full"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Adicionar Item
                            </Button>
                          </CardContent>
                        </CollapsibleContent>
                      </Card>
                    </Collapsible>
                  ))
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      {(mealPlan.notes || isEditing) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Observações</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!isEditing ? (
              <p className="text-gray-700 whitespace-pre-wrap">
                {mealPlan.notes || 'Nenhuma observação adicional.'}
              </p>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="notes">Observações Adicionais</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Observações, restrições, orientações especiais..."
                  rows={4}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default MealPlanDetail
