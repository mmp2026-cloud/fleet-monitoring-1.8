export type EquipmentStatus = 'Healthy' | 'Due for PMS' | 'Overdue' | 'Mechanical Plan'
export type Category = 'Light' | 'Heavy' | 'Drilling & Utility'

export type Equipment = {
  id: string; code: string; name: string; category: Category; location: string
  status: EquipmentStatus; smr: number; serviceInterval: number; lastService: string
  operator: string; nextDue: number; utilization: number; color: string
}

export const seededEquipment: Equipment[] = [
  { id: 'EQ-1042', code: 'TRK-1042', name: 'Haul truck 1042', category: 'Heavy', location: 'North pit', status: 'Healthy', smr: 18420, serviceInterval: 500, lastService: '2026-08-18', operator: 'M. Santos', nextDue: 18920, utilization: 86, color: '#21c98b' },
  { id: 'EQ-0988', code: 'EXC-0988', name: 'Excavator 988', category: 'Heavy', location: 'Crusher 2', status: 'Due for PMS', smr: 12780, serviceInterval: 250, lastService: '2026-09-02', operator: 'J. Dela Cruz', nextDue: 13030, utilization: 72, color: '#f7b84b' },
  { id: 'EQ-1201', code: 'LGT-1201', name: 'Service pickup 1201', category: 'Light', location: 'Workshop', status: 'Healthy', smr: 8430, serviceInterval: 500, lastService: '2026-07-24', operator: 'A. Reyes', nextDue: 8930, utilization: 54, color: '#21c98b' },
  { id: 'EQ-0764', code: 'DRL-0764', name: 'Drill rig 764', category: 'Drilling & Utility', location: 'South bench', status: 'Overdue', smr: 22610, serviceInterval: 250, lastService: '2026-07-10', operator: 'R. Navarro', nextDue: 22360, utilization: 91, color: '#ee6a65' },
  { id: 'EQ-1117', code: 'GEN-1117', name: 'Generator 1117', category: 'Drilling & Utility', location: 'Dewatering', status: 'Mechanical Plan', smr: 6190, serviceInterval: 1000, lastService: '2026-06-29', operator: 'P. Lim', nextDue: 7190, utilization: 48, color: '#a78bfa' },
  { id: 'EQ-1310', code: 'LGT-1310', name: 'Crew van 1310', category: 'Light', location: 'Admin yard', status: 'Healthy', smr: 3920, serviceInterval: 500, lastService: '2026-08-29', operator: 'K. Uy', nextDue: 4420, utilization: 39, color: '#21c98b' },
]

export const navItems = [
  ['Overview', '▦'], ['Equipment', '▣'], ['Verification queue', '✓'], ['Calendar', '◷'], ['Service history', '↺'],
]
