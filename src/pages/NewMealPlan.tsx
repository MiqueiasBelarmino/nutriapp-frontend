
import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { usePatients } from '@/hooks/usePatients'
import { useMealPlans } from '@/hooks/useMealPlans'
import { Apple, ArrowLeft, ChevronDown, ChevronUp, List, Plus, Trash2, Utensils, UtensilsCrossed, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { FoodAutocomplete } from '@/components/FoodAutocomplete'

interface Substitute {
  id: string
  name: string
  foodId?: string
  quantity: string
  observation?: string
}

interface MealItem {
  id: string
  name: string
  foodId?: string
  quantity: string
  observation?: string
  substitutes: Substitute[]
}

interface Meal {
  id: string
  name: string
  items: MealItem[]
}

const NewMealPlan: React.FC = () => {
  const navigate = useNavigate()
  const { patientId } = useParams<{ patientId: string }>()
  const { patients, fetchPatients } = usePatients()
  const { createMealPlan, generateSuggestion } = useMealPlans()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("");
  // const [patient, setPatient] = useState(null);
  const [planTitle, setPlanTitle] = useState("");
  const [meals, setMeals] = useState<Meal[]>([]);
  const [openMeals, setOpenMeals] = useState<Record<string, boolean>>({});

  const [formData, setFormData] = useState({
    patientId: patientId || '',
    date: new Date().toISOString().split('T')[0],
    content: '',
    // calories: '',
    notes: ''
  })

  useEffect(() => {
    fetchPatients()
  }, [])

  // const generateHTMLContent = () => {
  //   let html = `<h1>${planTitle}</h1>`;

  //   meals.forEach(meal => {
  //     html += `<h2>${meal.name || 'Refeição sem nome'}</h2>`;
  //     html += `<ul>`;

  //     meal.items.forEach(item => {
  //       html += `<li><strong>${item.quantity ? item.quantity + ' ' : ''}${item.name || 'Item sem nome'}</strong>`;

  //       if (item.substitutes && item.substitutes.length > 0) {
  //         html += `<ul style="margin-left: 20px; margin-top: 5px;">`;
  //         html += `<li style="font-style: italic; color: #64748B;">Substitutos:</li>`;
  //         item.substitutes.forEach(sub => {
  //           html += `<li style="color: #64748B;">${sub.quantity ? sub.quantity + ' ' : ''}${sub.name || 'Substituto sem nome'}</li>`;
  //         });
  //         html += `</ul>`;
  //       }

  //       html += `</li>`;
  //     });

  //     html += `</ul>`;
  //   });

  //   return html;
  // };

  const handleGenerateSuggestion = async () => {
    if (!formData.patientId) {
      // toast.error('Selecione um paciente primeiro');
      return;
    }

    setLoading(true);
    try {
      const suggestion = await generateSuggestion(formData.patientId);
      
      // Ensure IDs are strings and unique
      const mealsWithIds = suggestion.meals.map((meal: any) => ({
        ...meal,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        items: meal.items.map((item: any) => ({
          ...item,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          substitutes: item.substitutes?.map((sub: any) => ({
            ...sub,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          })) || []
        }))
      }));

      setMeals(mealsWithIds);
      
      // Auto-open all generated meals
      const newOpenMeals: Record<string, boolean> = {};
      mealsWithIds.forEach((meal: any) => {
        newOpenMeals[meal.id] = true;
      });
      setOpenMeals(newOpenMeals);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true);
    setError("");

    if (!formData.patientId) return

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
      }));

      await createMealPlan({
        patientId: formData.patientId,
        date: new Date(formData.date).toISOString(),
        content: mappedContent,
        notes: formData.notes || undefined
      })

      navigate(-1);
    } catch (error) {
      // Error is handled by the hook
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSelectChange = (field: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addMeal = () => {
    const newMeal = {
      id: Date.now().toString(),
      name: "",
      items: []
    };
    setMeals([...meals, newMeal]);
    setOpenMeals({ ...openMeals, [newMeal.id]: true });
  };

  const updateMealName = (mealId: string, name: string) => {
    setMeals(prev => prev.map(meal =>
      meal.id === mealId ? { ...meal, name } : meal
    ));
  };

  const removeMeal = (mealId: string) => {
    setMeals(meals.filter(meal => meal.id !== mealId));
    const newOpenMeals = { ...openMeals };
    delete newOpenMeals[mealId];
    setOpenMeals(newOpenMeals);
  };

  const addItem = (mealId: string) => {
    const newItem = {
      id: Date.now().toString(),
      name: "",
      quantity: "",
      observation: "",
      substitutes: []
    };
    setMeals(prev => prev.map(meal =>
      meal.id === mealId
        ? { ...meal, items: [...meal.items, newItem] }
        : meal
    ));
  };

  const removeItem = (mealId: string, itemId: string) => {
    setMeals(prev => prev.map(meal =>
      meal.id === mealId
        ? { ...meal, items: meal.items.filter(item => item.id !== itemId) }
        : meal
    ));
  };

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
    ));
  };

  const addSubstitute = (mealId: string, itemId: string) => {
    const newSubstitute = {
      id: Date.now().toString(),
      name: "",
      quantity: "",
      observation: ""
    };
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
    ));
  };

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
    ));
  };

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
    ));
  };

  const toggleMeal = (mealId: string) => {
    setOpenMeals({ ...openMeals, [mealId]: !openMeals[mealId] });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
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
          <h1 className="text-3xl font-bold text-gray-900">(EM CONSTRUÇÃO) Novo Plano Alimentar</h1>
          <p className="text-gray-600 mt-2">
            Crie um plano alimentar personalizado para o paciente
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center space-x-2 mb-6">
            <Utensils className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Informações do Plano</h2>
          </div>

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

            {/* <div className="space-y-2">
              <Label htmlFor="calories">Calorias Totais</Label>
              <Input
                id="calories"
                type="number"
                min="0"
                value={formData.calories}
                onChange={(e) => handleInputChange('calories', e.target.value)}
                placeholder="Ex: 2000"
              />
            </div> */}

            {/* {selectedPatient && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Paciente:</strong> {selectedPatient.name}
                </p>
              </div>
            )} */}
          </div>
        </div>

        {/* Meal Plan Content */}
        {/*
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-6">Conteúdo do Plano Alimentar</h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Plano Alimentar Detalhado *</Label>
              <RichTextEditor
                content={formData.content}
                onChange={(content) => handleInputChange('content', content)}
                placeholder="Descreva o plano alimentar detalhado..."
              />
            </div>

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
          </div>
        </div> 
        */}

        {/* Meals Section */}
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
              <Button
                type="button"
                onClick={handleGenerateSuggestion}
                disabled={loading || !formData.patientId}
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {loading ? 'Gerando...' : 'Gerar com IA'}
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
              meals.map((meal: Meal, mealIndex) => (
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
                          {meal.items.map((item: any, itemIndex: any) => (
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
                                      {/* <Input
                                        value={item.name}
                                        onChange={(e) => updateItem(meal.id, item.id, 'name', e.target.value)}
                                        placeholder="Ex: Arroz integral"
                                        required
                                        className="h-10"
                                      /> */}
                                      <FoodAutocomplete
                                        value={item.name}
                                        selectedId={item.foodId}
                                        onChange={(name, id) => {
                                          updateItem(meal.id, item.id, "name", name);
                                          updateItem(meal.id, item.id, "foodId", id || '');
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
                                  {item.substitutes.map((substitute: any) => (
                                    <div key={substitute.id} className="flex items-start gap-2 bg-white p-2 rounded border border-slate-200">
                                      <div className="flex-1 space-y-2">
                                        <div className="grid md:grid-cols-2 gap-2">
                                          <FoodAutocomplete
                                            value={substitute.name}
                                            selectedId={substitute.foodId}
                                            onChange={(name, id) => {
                                              updateSubstitute(meal.id, item.id, substitute.id, "name", name);
                                              updateSubstitute(meal.id, item.id, substitute.id, "foodId", id || '');
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

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/')}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            // disabled={loading || !formData.patientId || meals.length === 0 || !meals.some(meal => meal.items.some(item => item.foodId))}
          >
            {loading ? 'Salvando...' : 'Salvar Plano'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default NewMealPlan
