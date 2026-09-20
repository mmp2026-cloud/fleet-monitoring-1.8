import { describe, expect, it } from 'vitest'
import { seededEquipment } from './data'

describe('seeded fleet data', () => {
  it('contains a usable mix of operational statuses', () => {
    expect(seededEquipment.length).toBeGreaterThan(4)
    expect(new Set(seededEquipment.map(unit => unit.status))).toEqual(
      new Set(['Healthy', 'Due for PMS', 'Overdue', 'Mechanical Plan']),
    )
  })
})
