export type TestStandard = 'GBZ/T 192.1-2025' | 'GBZ/T 192.2-2025'

export interface Project {
  id: number
  employer_name: string
  test_number: string | null
  analysis_location: string | null
  analysis_date: string | null
  sampling_date: string | null
  test_standard: TestStandard
  sampling_temperature: number | null
  sampling_air_pressure: number | null
  analysis_temperature_min: number | null
  analysis_temperature_max: number | null
  analysis_humidity_min: number | null
  analysis_humidity_max: number | null
  instrument_name: string | null
  instrument_no: string | null
  analyst: string | null
  reviewer: string | null
  created_at: string
  updated_at: string
}

export interface ProjectFormData {
  employer_name: string
  test_number: string
  analysis_location: string
  analysis_date: string
  sampling_date: string
  test_standard: TestStandard
  sampling_temperature: number | null
  sampling_air_pressure: number | null
  analysis_temperature_min: number | null
  analysis_temperature_max: number | null
  analysis_humidity_min: number | null
  analysis_humidity_max: number | null
  instrument_name: string
  instrument_no: string
  analyst: string
  reviewer: string
}

export function createEmptyProjectForm(): ProjectFormData {
  return {
    employer_name: '',
    test_number: '',
    analysis_location: '',
    analysis_date: '',
    sampling_date: '',
    test_standard: 'GBZ/T 192.1-2025',
    sampling_temperature: null,
    sampling_air_pressure: null,
    analysis_temperature_min: null,
    analysis_temperature_max: null,
    analysis_humidity_min: null,
    analysis_humidity_max: null,
    instrument_name: '',
    instrument_no: '',
    analyst: '',
    reviewer: ''
  }
}