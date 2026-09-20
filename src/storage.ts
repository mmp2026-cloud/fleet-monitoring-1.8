import { Equipment, seededEquipment } from './data'

const KEY = 'forgefleet-equipment'
export const loadEquipment = (): Equipment[] => {
  try { const saved = localStorage.getItem(KEY); return saved ? JSON.parse(saved) : seededEquipment } catch { return seededEquipment }
}
export const saveEquipment = (items: Equipment[]) => localStorage.setItem(KEY, JSON.stringify(items))
export type DataProvider = { listEquipment: () => Equipment[]; saveEquipment: (items: Equipment[]) => void }
export const localProvider: DataProvider = { listEquipment: loadEquipment, saveEquipment }
