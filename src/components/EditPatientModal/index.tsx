
import { Patient } from '@/hooks/usePatients'
import React from 'react'

interface EditPatientModalProps {
  patient: Patient | null
  onsubmit: (e: any) => void
  oncancel: () => void
}

const EditPatientModal: React.FC<EditPatientModalProps> = ({ 
  patient, 
  onsubmit,
  oncancel
}) => {

  return (
    !patient ? null :
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Editar Paciente</h2>
            </div>

            <form onSubmit={onsubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    defaultValue={patient.name}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gênero *
                  </label>
                  <select
                    name="gender"
                    required
                    defaultValue={patient.gender}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Selecione</option>
                    <option value="male">Masculino</option>
                    <option value="female">Feminino</option>
                    <option value="other">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Nascimento *
                  </label>
                  <input
                    name="birthDate"
                    type="date"
                    required
                    defaultValue={patient.birthDate.split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone *
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    required
                    defaultValue={patient.phone}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    defaultValue={patient.email}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Peso Inicial (Kg) *
                  </label>
                  <input
                    name="weight"
                    type="number"
                    step={0.1}
                    required
                    defaultValue={patient.weight}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Altura (cm) *
                  </label>
                  <input
                    name="height"
                    type="number"
                    step={0.1}
                    required
                    defaultValue={patient.height}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                {/* <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Histórico Médico
                  </label>
                  <textarea
                    name="medicalHistory"
                    rows={4}
                    defaultValue={editingPatient.medicalHistory}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Alergias, condições médicas, medicamentos em uso..."
                  />
                </div> */}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => oncancel()}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
  )
}

export default EditPatientModal
