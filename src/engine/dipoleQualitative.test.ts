import { describe, expect, it } from 'vitest';
import { moleculeCatalog } from '../scenarios/moleculeCatalog';
import {
  bondDipoleVectors,
  classifyDipole,
  classifyMoleculeDipole,
  sumDirections,
} from './dipoleQualitative';

describe('qualitative dipole engine', () => {
  it('cancels opposite bond directions', () => expect(classifyDipole([[-1, 0, 0], [1, 0, 0]])).toBe('zero'));
  it('keeps a bent molecule nonzero', () => expect(classifyDipole([[-0.75, 0.64, 0], [0.75, 0.64, 0]])).toBe('nonzero'));
  it('returns a vector sum without a renderer', () => expect(sumDirections([[1, 2, 0], [-1, 0, 1]])).toEqual([0, 2, 1]));
  it('matches all 12 catalog polarity classes from coordinate vectors', () => {
    expect(moleculeCatalog.map(classifyMoleculeDipole)).toEqual(
      moleculeCatalog.map((molecule) => molecule.netDipoleClass),
    );
  });
  it('keeps zero/nonzero classification when every arrow is reversed', () => {
    moleculeCatalog.forEach((molecule) => {
      const reversed = molecule.bondDipoleDirection === 'center-to-outer'
        ? 'outer-to-center'
        : 'center-to-outer';
      expect(classifyDipole(bondDipoleVectors(molecule.idealCoordinates, reversed)))
        .toBe(molecule.netDipoleClass);
    });
  });
});
