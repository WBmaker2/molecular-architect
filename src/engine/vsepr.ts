import type { Geometry, Molecule } from '../domain/moleculeTypes';

const electronGeometries: Record<number, Geometry> = {
  2: '선형',
  3: '삼각 평면',
  4: '정사면체',
  5: '삼각쌍뿔',
  6: '팔면체',
};

const molecularGeometries: Record<string, Geometry> = {
  '2:0': '선형',
  '3:0': '삼각 평면',
  '3:1': '굽은형',
  '4:0': '정사면체',
  '4:1': '삼각뿔형',
  '4:2': '굽은형',
  '5:0': '삼각쌍뿔',
  '5:2': 'T자형',
  '6:0': '팔면체',
  '6:2': '평면 정사각형',
};

export function stericNumber(sigmaDomains: number, lonePairs: number): number {
  return sigmaDomains + lonePairs;
}

export function electronGeometryFor(steric: number): Geometry | null {
  return electronGeometries[steric] ?? null;
}

export function molecularGeometryFor(
  steric: number,
  lonePairs: number,
): Geometry | null {
  return molecularGeometries[`${steric}:${lonePairs}`] ?? null;
}

export function predictGeometry(sigmaDomains: number, lonePairs: number) {
  const steric = stericNumber(sigmaDomains, lonePairs);
  return {
    steric,
    electronGeometry: electronGeometryFor(steric),
    molecularGeometry: molecularGeometryFor(steric, lonePairs),
  };
}

export function isValidConfiguration(
  sigmaDomains: number,
  lonePairs: number,
): boolean {
  return Boolean(
    sigmaDomains >= 2 &&
      sigmaDomains <= 6 &&
      lonePairs >= 0 &&
      lonePairs <= 3 &&
      molecularGeometryFor(stericNumber(sigmaDomains, lonePairs), lonePairs),
  );
}

export function isReviewedConfiguration(
  molecule: Molecule,
  sigmaDomains: number,
  lonePairs: number,
): boolean {
  const result = predictGeometry(sigmaDomains, lonePairs);
  return (
    sigmaDomains === molecule.sigmaDomains &&
    lonePairs === molecule.lonePairs &&
    result.electronGeometry === molecule.electronGeometry &&
    result.molecularGeometry === molecule.molecularGeometry
  );
}
