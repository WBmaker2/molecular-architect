import type {
  BondDipoleDirection,
  DipoleClass,
  Molecule,
  Vec3,
} from '../domain/moleculeTypes';

function add(a: Vec3, b: Vec3): Vec3 {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

function magnitude(a: Vec3): number {
  return Math.hypot(a[0], a[1], a[2]);
}

/** Tail is δ+ and head is δ−. */
export function bondDipoleVectors(
  coordinates: Vec3[],
  direction: BondDipoleDirection,
): Vec3[] {
  return coordinates.map(([x, y, z]) =>
    direction === 'center-to-outer' ? [x, y, z] : [-x, -y, -z],
  );
}

export function sumDirections(directions: Vec3[]): Vec3 {
  return directions.reduce<Vec3>(add, [0, 0, 0]);
}

export function classifyDipole(
  directions: Vec3[],
  tolerance = 0.001,
): DipoleClass {
  return magnitude(sumDirections(directions)) <= tolerance ? 'zero' : 'nonzero';
}

export function classifyMoleculeDipole(molecule: Molecule): DipoleClass {
  return classifyDipole(
    bondDipoleVectors(molecule.idealCoordinates, molecule.bondDipoleDirection),
  );
}

export function qualitativeLabel(result: DipoleClass): string {
  return result === 'zero' ? '전체 비극성' : '전체 극성';
}

export function evidenceFor(
  result: DipoleClass,
  molecularGeometry: string,
): string {
  if (result === 'zero') {
    return `${molecularGeometry} 배치에서 반대 방향 결합 쌍극자가 대칭적으로 상쇄됩니다.`;
  }
  return `${molecularGeometry} 배치에서 결합 쌍극자의 방향 합이 0이 되지 않습니다.`;
}
