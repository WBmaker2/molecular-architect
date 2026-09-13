import type { Molecule } from '../domain/moleculeTypes';

interface Props { molecules: Molecule[]; selectedId: string; onSelect: (id: string) => void; }
export function MoleculeCardGrid({ molecules, selectedId, onSelect }: Props) {
  return <section className="catalog" data-od-id="molecule-catalog">
    <div className="section-kicker">01 / CATALOG</div><div className="section-heading"><h2>분자 재료를 고르세요</h2><span>검수 목록 12종 · 세션 메모리</span></div>
    <div className="molecule-grid">
      {molecules.map((molecule) => <button key={molecule.id} className={`molecule-card ${molecule.id === selectedId ? 'selected' : ''}`} onClick={() => onSelect(molecule.id)} aria-pressed={molecule.id === selectedId}>
        <span className="card-number">{molecule.id}</span><strong>{molecule.formula}</strong><span>{molecule.name}</span><small>{molecule.molecularGeometry}</small>
      </button>)}
    </div>
  </section>;
}
