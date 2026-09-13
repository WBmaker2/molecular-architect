import { describe, expect, it } from 'vitest';
import { isReviewedConfiguration, molecularGeometryFor, predictGeometry, stericNumber } from './vsepr';
import { moleculeCatalog } from '../scenarios/moleculeCatalog';
import { classifyMoleculeDipole } from './dipoleQualitative';

const expected = {
  M01: ['선형', '선형', 'center-to-outer', 'zero'],
  M02: ['정사면체', '굽은형', 'outer-to-center', 'nonzero'],
  M03: ['삼각 평면', '삼각 평면', 'center-to-outer', 'zero'],
  M04: ['정사면체', '삼각뿔형', 'outer-to-center', 'nonzero'],
  M05: ['정사면체', '정사면체', 'outer-to-center', 'zero'],
  M06: ['정사면체', '정사면체', 'center-to-outer', 'zero'],
  M07: ['선형', '선형', 'center-to-outer', 'zero'],
  M08: ['삼각 평면', '굽은형', 'center-to-outer', 'nonzero'],
  M09: ['삼각쌍뿔', '삼각쌍뿔', 'center-to-outer', 'zero'],
  M10: ['팔면체', '팔면체', 'center-to-outer', 'zero'],
  M11: ['삼각쌍뿔', 'T자형', 'center-to-outer', 'nonzero'],
  M12: ['팔면체', '평면 정사각형', 'center-to-outer', 'zero'],
} as const;

describe('VSEPR engine', () => {
  it('computes steric number independently', () => expect(stericNumber(2, 2)).toBe(4));
  it('maps water to tetrahedral electron domains and bent shape', () => {
    expect(predictGeometry(2, 2)).toEqual({ steric: 4, electronGeometry: '정사면체', molecularGeometry: '굽은형' });
  });
  it('maps trigonal bipyramidal with two lone pairs to T shape', () => expect(molecularGeometryFor(5, 2)).toBe('T자형'));
  it('only marks the catalog settings as reviewed', () => {
    const water = moleculeCatalog.find((molecule) => molecule.id === 'M02')!;
    expect(isReviewedConfiguration(water, 2, 2)).toBe(true);
    expect(isReviewedConfiguration(water, 3, 1)).toBe(false);
  });
  it('uses equal-length symmetric outer coordinates for NH3', () => {
    const ammonia = moleculeCatalog.find((molecule) => molecule.id === 'M04')!;
    const lengths = ammonia.idealCoordinates.map(([x, y, z]) => Math.hypot(x, y, z));
    expect(lengths[0]).toBeCloseTo(lengths[1], 3);
    expect(lengths[1]).toBeCloseTo(lengths[2], 3);
    expect(ammonia.idealCoordinates.reduce((sum, [x]) => sum + x, 0)).toBeCloseTo(0, 3);
  });
  it('matches the complete 12-molecule QA table', () => {
    moleculeCatalog.forEach((molecule) => {
      expect([
        molecule.electronGeometry,
        molecule.molecularGeometry,
        molecule.bondDipoleDirection,
        classifyMoleculeDipole(molecule),
      ]).toEqual(expected[molecule.id as keyof typeof expected]);
    });
  });
});
