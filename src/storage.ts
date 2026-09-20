import { Equipment, OperatorSubmission, seededEquipment } from './data'

const EQUIPMENT_KEY = 'forgefleet-equipment'
const SUBMISSIONS_KEY = 'forgefleet-operator-submissions'
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
export type DataProvider = { listEquipment: () => Equipment[]; saveEquipment: (items: Equipment[]) => void; listSubmissions: () => OperatorSubmission[]; saveSubmissions: (items: OperatorSubmission[]) => void }
export const localProvider: DataProvider = { listEquipment: loadEquipment, saveEquipment, listSubmissions: loadSubmissions, saveSubmissions }
