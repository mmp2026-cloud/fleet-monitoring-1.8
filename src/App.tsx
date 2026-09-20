import { useEffect, useMemo, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { Category, Equipment, EquipmentStatus, navItems } from './data'
import { loadEquipment, saveEquipment } from './storage'

const icons: Record<string, string> = { Overview: '▦', Equipment: '▣', 'Verification queue': '✓', Calendar: '◷', 'Service history': '↺' }
const statuses: EquipmentStatus[] = ['Healthy', 'Due for PMS', 'Overdue', 'Mechanical Plan']
const fmt = (n: number) => n.toLocaleString()

function StatusPill({ status }: { status: EquipmentStatus }) { return <span className={`pill ${status.toLowerCase().replaceAll(' ', '-')}`}>{status}</span> }

function App() {
  const [equipment, setEquipment] = useState(loadEquipment)
  const [active, setActive] = useState('Overview')
  const [selected, setSelected] = useState(equipment[1]?.id ?? '')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<'All' | Category>('All')
  const [showRegister, setShowRegister] = useState(false)
  const [showScan, setShowScan] = useState(false)
  const [showBreakdown, setShowBreakdown] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [toast, setToast] = useState('')
  const current = equipment.find(e => e.id === selected) ?? equipment[0]
  const filtered = useMemo(() => equipment.filter(e => (category === 'All' || e.category === category) && `${e.name} ${e.code} ${e.location}`.toLowerCase().includes(query.toLowerCase())), [equipment, category, query])
  const update = (next: typeof equipment) => { setEquipment(next); saveEquipment(next) }
  const notify = (msg: string) => { setToast(msg); window.setTimeout(() => setToast(''), 2800) }
  const counts = statuses.reduce((a, s) => ({ ...a, [s]: equipment.filter(e => e.status === s).length }), {} as Record<EquipmentStatus, number>)

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark">F</div><div><strong>ForgeFleet</strong><small>OPERATIONS OS</small></div></div>
      <div className="site-switcher"><span className="site-dot" /> <span><b>Kalumbila mine</b><small>Active site · Shift A</small></span><span className="chevron">⌄</span></div>
      <nav aria-label="Primary navigation">{navItems.map(([label]) => <button className={active === label ? 'nav-active' : ''} onClick={() => setActive(label)} key={label}><span>{icons[label]}</span>{label}{label === 'Verification queue' && <em>8</em>}</button>)}</nav>
      <div className="sidebar-foot"><div className="sync"><i /> Synced 2 min ago</div><div className="profile"><div className="avatar">TS</div><span><b>T. Simons</b><small>Fleet administrator</small></span><span>•••</span></div></div>
    </aside>
    <main className="main">
      <header className="topbar"><div className="mobile-brand">ForgeFleet</div><div className="breadcrumbs">Operations <span>/</span> {active}</div><div className="top-actions"><button className="icon-btn" aria-label="Notifications">♧<b>3</b></button><div className="avatar">TS</div></div></header>
      <div className="content">
        <section className="page-heading"><div><p className="eyebrow">SUNDAY, 20 SEPTEMBER 2026 · 08:42</p><h1>{active === 'Overview' ? 'Good morning, Tessa' : active}</h1><p className="subhead">{active === 'Overview' ? 'Here’s the fleet pulse for your current shift.' : 'Keep every unit moving, safe and accountable.'}</p></div><div className="heading-actions"><button className="secondary" onClick={() => setShowScan(true)}>⌾ Scan QR</button><button className="primary" onClick={() => setShowRegister(true)}>＋ Register equipment</button></div></section>
        {active === 'Overview' && <Overview equipment={equipment} counts={counts} onSelect={(id: string) => { setSelected(id); setActive('Equipment') }} onAction={() => setShowScan(true)} />}
        {active === 'Equipment' && <EquipmentView equipment={filtered} current={current} selected={selected} setSelected={setSelected} query={query} setQuery={setQuery} category={category} setCategory={setCategory} onRegister={() => setShowRegister(true)} notify={notify} onBreakdown={() => setShowBreakdown(true)} onDelete={() => setShowDelete(true)} />}
        {active === 'Verification queue' && <Queue equipment={equipment} onApprove={(id: string) => { update(equipment.map(e => e.id === id ? { ...e, status: 'Healthy' } : e)); notify('Reading verified and maintenance forecast updated') }} />}
        {active === 'Calendar' && <Calendar equipment={equipment} />}
        {active === 'Service history' && <History equipment={equipment} />}
      </div>
    </main>
    {showRegister && <Register onClose={() => setShowRegister(false)} onSave={(item: Equipment) => { update([item, ...equipment]); setShowRegister(false); notify('Equipment registered successfully') }} />}
    {showScan && <Scan equipment={equipment} onClose={() => setShowScan(false)} onSave={(id: string, smr: number, note: string) => { update(equipment.map(e => e.id === id ? { ...e, smr, status: 'Healthy' } : e)); setShowScan(false); notify(`Reading saved for ${id}${note ? ' · evidence attached' : ''}`) }} />}
    {showBreakdown && <Breakdown equipment={equipment} initialId={selected} onClose={() => setShowBreakdown(false)} onSave={(id: string, severity: string) => { update(equipment.map(e => e.id === id ? { ...e, status: 'Mechanical Plan' } : e)); setShowBreakdown(false); notify(`Breakdown reported for ${id} · ${severity} priority`) }} />}
    {showDelete && current && <DeleteEquipment equipment={current} onClose={() => setShowDelete(false)} onConfirm={() => { const remaining = equipment.filter(e => e.id !== current.id); update(remaining); setSelected(remaining[0]?.id ?? ''); setShowDelete(false); notify(`${current.code} removed from fleet`) }} />}
    {toast && <div className="toast">✓ {toast}</div>}
  </div>
}

function Overview({ equipment, counts, onSelect, onAction }: { equipment: ReturnType<typeof loadEquipment>; counts: Record<EquipmentStatus, number>; onSelect: (id: string) => void; onAction: () => void }) {
  return <><div className="metric-grid">{[['Fleet total', equipment.length, '100% reporting', 'blue'], ['Healthy', counts.Healthy, 'Ready for work', 'green'], ['Needs attention', counts['Due for PMS'] + counts.Overdue, '2 overdue', 'amber'], ['Open work orders', 12, '3 high priority', 'purple']].map(([label, value, detail, color]) => <div className="metric-card" key={label as string}><div className={`metric-icon ${color}`}>{label === 'Fleet total' ? '▦' : label === 'Healthy' ? '✓' : label === 'Needs attention' ? '!' : '⚒'}</div><div><span>{label}</span><strong>{value}</strong><small>{detail}</small></div><span className="metric-trend">↗</span></div>)}</div>
    <div className="dashboard-grid"><section className="panel utilization"><div className="panel-head"><div><h2>Fleet utilisation</h2><p>Average operating hours · last 7 days</p></div><button className="text-btn">View report →</button></div><div className="chart"><div className="y-axis"><span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span></div><div className="bars">{[61,72,64,83,76,88,79].map((v, i) => <div className="bar-group" key={i}><div className="bar" style={{ height: `${v}%` }}><span>{v}%</span></div><small>{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i]}</small></div>)}</div></div><div className="chart-legend"><span><i className="legend-line" />Utilisation</span><span>Target <b>75%</b></span></div></section>
      <section className="panel attention"><div className="panel-head"><div><h2>Needs attention</h2><p>Prioritised by risk and due date</p></div><button className="text-btn" onClick={onAction}>Scan reading →</button></div>{equipment.filter(e => e.status !== 'Healthy').map(e => <button className="attention-row" key={e.id} onClick={() => onSelect(e.id)}><span className="equipment-mini" style={{ background: e.color }}>{e.code.slice(0, 3)}</span><span className="row-main"><b>{e.name}</b><small>{e.location} · {fmt(e.smr)} SMR</small></span><StatusPill status={e.status} /><span className="row-arrow">→</span></button>)}</section></div>
    <section className="panel table-panel"><div className="panel-head"><div><h2>Fleet status</h2><p>Live status across all registered equipment</p></div><button className="text-btn" onClick={() => onSelect(equipment[0].id)}>View all equipment →</button></div><EquipmentTable equipment={equipment.slice(0, 5)} onSelect={onSelect} /></section></>
}

function EquipmentTable({ equipment, onSelect }: { equipment: ReturnType<typeof loadEquipment>; onSelect: (id: string) => void }) { return <div className="table-wrap"><table><thead><tr><th>Equipment</th><th>Category</th><th>Location</th><th>SMR / odometer</th><th>Next service</th><th>Status</th><th /></tr></thead><tbody>{equipment.map(e => <tr key={e.id} onClick={() => onSelect(e.id)}><td><span className="table-unit" style={{ background: e.color }}>{e.code.slice(0, 3)}</span><span><b>{e.name}</b><small>{e.code}</small></span></td><td>{e.category}</td><td>{e.location}</td><td><b>{fmt(e.smr)}</b> <small>SMR</small></td><td><b>{fmt(e.nextDue)}</b> <small>SMR</small></td><td><StatusPill status={e.status} /></td><td className="row-arrow">→</td></tr>)}</tbody></table></div> }

function EquipmentView({ equipment, current, selected, setSelected, query, setQuery, category, setCategory, onRegister, notify, onBreakdown, onDelete }: any) { return <div className="equipment-layout"><section className="panel table-panel"><div className="toolbar"><div className="search"><span>⌕</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search equipment, code or location" /></div><select value={category} onChange={e => setCategory(e.target.value)}><option>All</option><option>Light</option><option>Heavy</option><option>Drilling & Utility</option></select><button className="secondary" onClick={onRegister}>＋ Add</button></div><EquipmentTable equipment={equipment} onSelect={setSelected} /></section><section className="panel detail-panel">{current ? <><div className="detail-top"><div className="unit-illustration" style={{ background: current.color }}>{current.code.slice(0, 3)}</div><div><p className="eyebrow">{current.code}</p><h2>{current.name}</h2><p>{current.location} · {current.operator}</p></div></div><StatusPill status={current.status} /><div className="detail-stats"><div><span>Current SMR</span><b>{fmt(current.smr)}</b><small>hours</small></div><div><span>Next service</span><b>{fmt(current.nextDue)}</b><small>{Math.max(0, current.nextDue - current.smr)} hours left</small></div><div><span>Utilisation</span><b>{current.utilization}%</b><small>last 7 days</small></div></div><div className="qr-box"><QRCodeLabel value={current.code} /><div><b>Unit QR label</b><p>Scan to submit a reading</p><button className="text-btn" onClick={() => { window.print(); notify('Print dialog opened') }}>Print label →</button></div></div><div className="detail-actions"><button className="primary wide" onClick={() => notify('Maintenance override logged')}>＋ Manual maintenance override</button><button className="secondary wide" onClick={() => notify('Service record form opened')}>View service records</button><button className="breakdown-button wide" onClick={onBreakdown}>⚠ Report breakdown / repair</button><button className="delete-button wide" onClick={onDelete}>Delete incorrect unit</button></div></> : <div className="empty-state"><h2>No equipment selected</h2><p>Register a unit to start tracking the fleet.</p></div>}</section></div> }

function QRCodeLabel({ value }: { value: string }) {
  const [src, setSrc] = useState('')
  useEffect(() => { QRCode.toDataURL(`https://mmp2026-cloud.github.io/fleet-monitoring-1.8/?equipment=${encodeURIComponent(value)}`, { width: 180, margin: 1 }).then(setSrc).catch(() => setSrc('')) }, [value])
  return src ? <img className="qr-image" src={src} alt={`QR code for ${value}`} /> : <div className="qr-loading">Generating QR…</div>
}

function Queue({ equipment, onApprove }: any) { return <section className="panel queue-panel"><div className="panel-head"><div><h2>Verification queue <span className="count-badge">8</span></h2><p>Operator readings waiting for supervisor review</p></div><button className="secondary">Export queue</button></div>{equipment.slice(0, 4).map((e: any, i: number) => <div className="queue-row" key={e.id}><div className="avatar operator-avatar">{['JM','RD','AL','PS'][i]}</div><div className="row-main"><b>{e.name} · {e.code}</b><small>{['J. Mendoza','R. Dizon','A. Lim','P. Santos'][i]} · Today, {['08:34','08:02','07:48','07:19'][i]}</small></div><div className="reading"><b>{fmt(e.smr + i * 8)}</b><small>SMR submitted</small></div><span className="evidence">▧ Evidence</span><button className="approve" onClick={() => onApprove(e.id)}>Approve</button></div>)}</section> }
function Calendar({ equipment }: any) { return <section className="panel calendar-panel"><div className="panel-head"><div><h2>Maintenance forecast</h2><p>Upcoming service windows based on usage trend</p></div><button className="secondary">＋ Add override</button></div><div className="calendar-grid">{['SEP 21','SEP 22','SEP 23','SEP 24','SEP 25','SEP 26','SEP 27'].map((d, i) => <div className="day" key={d}><b>{d}</b>{equipment.filter((e: any) => (e.nextDue - e.smr) / 10 <= i + 1).slice(0, 2).map((e: any) => <div className="event" style={{ borderLeftColor: e.color }} key={e.id}><b>{e.code}</b><small>{e.status === 'Overdue' ? 'Overdue · inspect' : 'PMS forecast'}</small></div>)}</div>)}</div></section> }
function History({ equipment }: any) { return <section className="panel table-panel"><div className="panel-head"><div><h2>Service history</h2><p>Completed work and historical readings</p></div><button className="secondary">Export CSV</button></div><table><thead><tr><th>Date</th><th>Equipment</th><th>Work type</th><th>SMR reading</th><th>Technician</th><th>Result</th></tr></thead><tbody>{equipment.concat(equipment.slice(0, 2)).map((e: any, i: number) => <tr key={`${e.id}-${i}`}><td>Sep {20 - i}, 2026</td><td><b>{e.code}</b><small>{e.name}</small></td><td>{i % 2 ? 'Operator reading' : 'Preventive service'}</td><td>{fmt(e.smr - i * 112)}</td><td>{i % 2 ? e.operator : 'Workshop team'}</td><td><span className="result">✓ Verified</span></td></tr>)}</tbody></table></section> }

function Register({ onClose, onSave }: any) { const [name, setName] = useState(''); const [code, setCode] = useState(''); const [cat, setCat] = useState<Category>('Heavy'); return <Modal title="Register equipment" onClose={onClose}><p className="modal-lead">Add a unit to your fleet. A unique QR label will be generated automatically.</p><label>Equipment name<input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Loader 204" /></label><label>Fleet code<input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="e.g. LDR-0204" /></label><label>Category<select value={cat} onChange={e => setCat(e.target.value as Category)}><option>Light</option><option>Heavy</option><option>Drilling & Utility</option></select></label><div className="modal-actions"><button className="secondary" onClick={onClose}>Cancel</button><button className="primary" disabled={!name || !code} onClick={() => onSave({ id: `EQ-${Date.now().toString().slice(-4)}`, code, name, category: cat, location: 'Unassigned', status: 'Healthy', smr: 0, serviceInterval: 500, lastService: new Date().toISOString().slice(0, 10), operator: 'Unassigned', nextDue: 500, utilization: 0, color: '#60a5fa' })}>Create equipment</button></div></Modal> }
function Scan({ equipment, onClose, onSave }: any) {
  const [id, setId] = useState(equipment[0]?.id ?? '')
  const [smr, setSmr] = useState('')
  const [note, setNote] = useState('')
  const [scanning, setScanning] = useState(false)
  const [message, setMessage] = useState('Camera access requires HTTPS and browser permission.')
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  useEffect(() => () => streamRef.current?.getTracks().forEach(track => track.stop()), [])
  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) { setMessage('Camera is not available in this browser. Select the unit manually below.'); return }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      setScanning(true)
      const BarcodeDetectorCtor = (window as Window & { BarcodeDetector?: new (options?: { formats: string[] }) => { detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue: string }>> } }).BarcodeDetector
      if (!BarcodeDetectorCtor) { setMessage('Live camera opened. This browser cannot decode QR automatically, so select the unit manually.'); return }
      const detector = new BarcodeDetectorCtor({ formats: ['qr_code'] })
      const read = async () => {
        if (!videoRef.current || !streamRef.current) return
        try {
          const result = await detector.detect(videoRef.current)
          const match = result.find(item => equipment.some((unit: any) => item.rawValue.includes(unit.code) || item.rawValue.includes(unit.id)))
          if (match) {
            const unit = equipment.find((item: any) => match.rawValue.includes(item.code) || match.rawValue.includes(item.id))
            if (unit) { setId(unit.id); setMessage(`Detected ${unit.code}. Enter the current SMR below.`); streamRef.current.getTracks().forEach(track => track.stop()); streamRef.current = null; setScanning(false); return }
          }
        } catch { setMessage('Keep the QR label inside the camera frame.') }
        window.setTimeout(read, 500)
      }
      window.setTimeout(read, 500)
    } catch { setMessage('Camera permission was blocked. Allow camera access in the browser address bar, then try again.') }
  }
  return <Modal title="Scan & submit reading" onClose={onClose}><div className="scan-target">{scanning ? <video ref={videoRef} autoPlay muted playsInline className="scanner-video" /> : <div className="scan-frame">⌾</div>}<div><b>{scanning ? 'Point camera at unit QR label' : 'QR scanner ready'}</b><p>{message}</p></div><button className="secondary" onClick={startCamera}>{scanning ? 'Camera on' : 'Use camera'}</button></div><label>Equipment<select value={id} onChange={e => setId(e.target.value)}>{equipment.map((e: any) => <option key={e.id} value={e.id}>{e.code} · {e.name}</option>)}</select></label><label>Current SMR / odometer<input type="number" value={smr} onChange={e => setSmr(e.target.value)} placeholder="Enter reading" /></label><label>Notes (optional)<textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Any leaks, damage or observations?" /></label><div className="upload">▧ <span><b>Add photo evidence</b><small>Upload from device or take a photo</small></span><input type="file" accept="image/*" /></div><div className="modal-actions"><button className="secondary" onClick={onClose}>Cancel</button><button className="primary" disabled={!smr || !id} onClick={() => onSave(id, Number(smr), note)}>Submit for verification</button></div></Modal>
}
function DeleteEquipment({ equipment, onClose, onConfirm }: { equipment: Equipment; onClose: () => void; onConfirm: () => void }) {
  return <Modal title="Delete equipment unit" onClose={onClose}><p className="modal-lead">Remove <b>{equipment.code} · {equipment.name}</b> from this browser’s fleet data. This cannot be undone.</p><div className="modal-actions"><button className="secondary" onClick={onClose}>Keep unit</button><button className="delete-button" onClick={onConfirm}>Delete unit</button></div></Modal>
}
function Breakdown({ equipment, initialId, onClose, onSave }: any) { const [id, setId] = useState(initialId || equipment[0]?.id); const [severity, setSeverity] = useState('High'); const [issue, setIssue] = useState(''); return <Modal title="Report breakdown / repair" onClose={onClose}><p className="modal-lead">Create an incident and route the unit to the maintenance team.</p><label>Equipment<select value={id} onChange={e => setId(e.target.value)}>{equipment.map((e: any) => <option key={e.id} value={e.id}>{e.code} · {e.name}</option>)}</select></label><label>Priority<select value={severity} onChange={e => setSeverity(e.target.value)}><option>Critical</option><option>High</option><option>Medium</option><option>Low</option></select></label><label>Fault / repair description<textarea autoFocus value={issue} onChange={e => setIssue(e.target.value)} placeholder="Describe the symptom, damage or repair required" /></label><div className="upload">▧ <span><b>Add damage photo</b><small>Attach evidence for the workshop</small></span><input type="file" accept="image/*" /></div><div className="modal-actions"><button className="secondary" onClick={onClose}>Cancel</button><button className="primary" disabled={!issue.trim()} onClick={() => onSave(id, severity)}>Create repair report</button></div></Modal> }
function Modal({ title, onClose, children }: any) { return <div className="modal-backdrop" role="presentation" onMouseDown={e => e.target === e.currentTarget && onClose()}><div className="modal" role="dialog" aria-modal="true"><div className="modal-head"><h2>{title}</h2><button className="close" onClick={onClose} aria-label="Close">×</button></div>{children}</div></div> }

export default App
