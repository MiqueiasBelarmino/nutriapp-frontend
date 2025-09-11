
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

 export const calculateAge = (birthDate: any) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

export function calculateBMI(weight: number, height: number): number {
  const heightInMeters = height / 100
  return Number((weight / (heightInMeters * heightInMeters)).toFixed(1))
}

// Body fat calculation formulas
export function calculateBodyFat(
  formula: 'Faulkner' | 'Pollock' | 'Jackson',
  measurements: {
    triceps?: number
    subscapular?: number
    suprailiac?: number
    abdominal?: number
  },
  gender: 'male' | 'female',
  age?: number
): number {
  const { triceps = 0, subscapular = 0, suprailiac = 0, abdominal = 0 } = measurements

  switch (formula) {
    case 'Faulkner':
      // Faulkner formula
      if (gender === 'male') {
        return Number((0.153 * (triceps + subscapular + suprailiac + abdominal) + 5.783).toFixed(1))
      } else {
        return Number((0.213 * (triceps + subscapular + suprailiac + abdominal) + 7.9).toFixed(1))
      }

    case 'Pollock':
      // Pollock 4-site formula
      const sum4 = triceps + subscapular + suprailiac + abdominal
      if (gender === 'male') {
        const density = 1.112 - (0.00043499 * sum4) + (0.00000055 * sum4 * sum4) - (0.00028826 * (age || 25))
        return Number(((495 / density) - 450).toFixed(1))
      } else {
        const density = 1.097 - (0.00046971 * sum4) + (0.00000056 * sum4 * sum4) - (0.00012828 * (age || 25))
        return Number(((495 / density) - 450).toFixed(1))
      }

    case 'Jackson':
      // Jackson-Pollock formula
      const sum3 = triceps + subscapular + suprailiac
      if (gender === 'male') {
        const density = 1.109380 - (0.0008267 * sum3) + (0.0000016 * sum3 * sum3) - (0.0002574 * (age || 25))
        return Number(((495 / density) - 450).toFixed(1))
      } else {
        const density = 1.099421 - (0.0009929 * sum3) + (0.0000023 * sum3 * sum3) - (0.0001392 * (age || 25))
        return Number(((495 / density) - 450).toFixed(1))
      }

    default:
      return 0
  }
}

export function calculateBodyComposition(weight: number, fatPercent: number) {
  const fatMass = Number((weight * (fatPercent / 100)).toFixed(1))
  const leanMass = Number((weight - fatMass).toFixed(1))
  
  return { fatMass, leanMass }
}
