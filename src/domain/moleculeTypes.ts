export type Geometry = '선형' | '삼각 평면' | '굽은형' | '정사면체' | '삼각뿔형' | '삼각쌍뿔' | 'T자형' | '팔면체' | '평면 정사각형';
export type DipoleClass = 'zero' | 'nonzero';
export type BondDipoleDirection = 'center-to-outer' | 'outer-to-center';

export type Vec3 = [number, number, number];

export interface Molecule {
  id: string;
  name: string;
  formula: string;
  charge: number;
  centralAtom: string;
  atoms: string[];
  sigmaDomains: number;
  lonePairs: number;
  electronGeometry: Geometry;
  molecularGeometry: Geometry;
  bondPolarity: '극성 결합' | '약한 결합 극성 모형';
  netDipoleClass: DipoleClass;
  bondDipoleDirection: BondDipoleDirection;
  idealCoordinates: Vec3[];
  sourceIds: string[];
  reviewStatus: string;
  condition?: string;
}

export interface Prediction {
  netDipole: DipoleClass;
  reason: string;
}

export interface RunRecord {
  moleculeId: string;
  prediction: DipoleClass;
  result: DipoleClass;
  geometry: Geometry;
  evidence: string[];
  timestamp: string;
}
