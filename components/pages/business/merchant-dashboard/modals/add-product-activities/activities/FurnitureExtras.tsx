import React, { useMemo } from 'react';
import FurnitureOptionsSection from '../../AddProduct/FurnitureOptionsSection';

type Props = {
  furnitureUnit: string;
  setFurnitureUnit: React.Dispatch<React.SetStateAction<string>>;
  furnitureLengthCm: string;
  setFurnitureLengthCm: React.Dispatch<React.SetStateAction<string>>;
  furnitureWidthCm: string;
  setFurnitureWidthCm: React.Dispatch<React.SetStateAction<string>>;
  furnitureHeightCm: string;
  setFurnitureHeightCm: React.Dispatch<React.SetStateAction<string>>;
  unit: string;
  parseNumberInput: (v: any) => number;
};

const FurnitureExtras: React.FC<Props> = ({
  furnitureUnit,
  setFurnitureUnit,
  furnitureLengthCm,
  setFurnitureLengthCm,
  furnitureWidthCm,
  setFurnitureWidthCm,
  furnitureHeightCm,
  setFurnitureHeightCm,
  unit,
}) => {
  return (
    <FurnitureOptionsSection
      furnitureUnit={furnitureUnit}
      setFurnitureUnit={setFurnitureUnit}
      furnitureLengthCm={furnitureLengthCm}
      setFurnitureLengthCm={setFurnitureLengthCm}
      furnitureWidthCm={furnitureWidthCm}
      setFurnitureWidthCm={setFurnitureWidthCm}
      furnitureHeightCm={furnitureHeightCm}
      setFurnitureHeightCm={setFurnitureHeightCm}
      unit={unit}
    />
  );
};

export function buildFurnitureExtrasPayload(args: {
  furnitureUnit: string;
  unit: string;
  furnitureLengthCm: string;
  furnitureWidthCm: string;
  furnitureHeightCm: string;
  parseNumberInput: (v: any) => number;
}) {
  const { furnitureUnit, unit, furnitureLengthCm, furnitureWidthCm, furnitureHeightCm, parseNumberInput } = args;

  const u = String((furnitureUnit || unit || '').trim());
  const l = parseNumberInput(furnitureLengthCm);
  const w = parseNumberInput(furnitureWidthCm);
  const h = parseNumberInput(furnitureHeightCm);

  const lengthCm = Number.isFinite(l) && l > 0 ? Math.round(l * 100) / 100 : undefined;
  const widthCm = Number.isFinite(w) && w > 0 ? Math.round(w * 100) / 100 : undefined;
  const heightCm = Number.isFinite(h) && h > 0 ? Math.round(h * 100) / 100 : undefined;

  const meta: any = {
    ...(u ? { unit: u } : {}),
    ...(typeof lengthCm === 'number' ? { lengthCm } : {}),
    ...(typeof widthCm === 'number' ? { widthCm } : {}),
    ...(typeof heightCm === 'number' ? { heightCm } : {}),
  };

  const furnitureMeta = Object.keys(meta).length ? meta : undefined;
  return { payload: { furnitureMeta, unit: u || undefined } };
}

export default FurnitureExtras;
