import { Category, defaultCategories, Equipment, MaintenanceCall, OperatorSubmission, seededEquipment } from './data'

const EQUIPMENT_KEY = 'forgefleet-equipment'
const SUBMISSIONS_KEY = 'forgefleet-operator-submissions'
const CALLS_KEY = 'forgefleet-maintenance-calls'
const CATEGORIES_KEY = 'forgefleet-categories'
const read = <T,>(key: string, fallback: T): T => {
  try { const saved = localStorage.getItem(key); return saved ? JSON.parse(saved) as T : fallback } catch { return fallback }
}
export const loadEquipment = (): Equipment[] => read(EQUIPMENT_KEY, seededEquipment).map(unit => ({
  ...unit,
  pmInterval: unit.pmInterval ?? unit.serviceInterval ?? 500,
  serviceInterval: unit.serviceInterval ?? unit.pmInterval ?? 500,
  lastPmsReading: unit.lastPmsReading ?? unit.smr,
  currentReading: unit.currentReading ?? unit.smr,
}))
export const saveEquipment = (items: Equipment[]) => localStorage.setItem(EQUIPMENT_KEY, JSON.stringify(items))
export const loadSubmissions = (): OperatorSubmission[] => read(SUBMISSIONS_KEY, [])
export const saveSubmissions = (items: OperatorSubmission[]) => localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(items))
export const loadMaintenanceCalls = (): MaintenanceCall[] => read(CALLS_KEY, [])
export const saveMaintenanceCalls = (items: MaintenanceCall[]) => localStorage.setItem(CALLS_KEY, JSON.stringify(items))
export const loadCategories = (): Category[] => Array.from(new Set(read(CATEGORIES_KEY, defaultCategories).filter(Boolean)))
export const saveCategories = (items: Category[]) => localStorage.setItem(CATEGORIES_KEY, JSON.stringify(Array.from(new Set(items.filter(Boolean)))))
export type DataProvider = { listEquipment: () => Equipment[]; saveEquipment: (items: Equipment[]) => void; listSubmissions: () => OperatorSubmission[]; saveSubmissions: (items: OperatorSubmission[]) => void; listMaintenanceCalls: () => MaintenanceCall[]; saveMaintenanceCalls: (items: MaintenanceCall[]) => void }
export const localProvider: DataProvider = { listEquipment: loadEquipment, saveEquipment, listSubmissions: loadSubmissions, saveSubmissions, listMaintenanceCalls: loadMaintenanceCalls, saveMaintenanceCalls }
