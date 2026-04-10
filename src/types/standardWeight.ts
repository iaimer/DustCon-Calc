export type StandardWeightResult = '合格' | '不合格' | ''

export interface StandardWeight {
  id: number | null
  project_id: number
  weight_no: string
  original_mass: number | null
  current_mass: number | null
  check_result: StandardWeightResult
}

export interface StandardWeightFormData {
  id: number | null
  weight_no: string
  original_mass: number | null
  current_mass: number | null
}

export interface StandardWeightCreateData {
  project_id: number
  weight_no: string
  original_mass: number | null
  current_mass: number | null
  check_result: string
}

export interface StandardWeightUpdateData {
  weight_no: string
  original_mass: number | null
  current_mass: number | null
  check_result: string
}

export function createEmptyStandardWeightForm(): StandardWeightFormData {
  return {
    id: null,
    weight_no: 'HX663',
    original_mass: 50.00,
    current_mass: null
  }
}