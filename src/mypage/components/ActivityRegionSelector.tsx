import { useMemo, useState } from 'react';
import type { CodeLookupResponse } from '../../api/codes';
import { labelOf, sortSido } from '../../lib/referenceData';

type Mode = 'chip' | 'type';

interface ActivityRegionSelectorProps {
  mode: Mode;
  regionOptions: CodeLookupResponse[];
  regionMap: Map<string, string>;
  value: string[];
  onChange(next: string[]): void;
  maxSelections?: number;
}

function isSelected(values: string[], code: string): boolean {
  return values.includes(code);
}

export default function ActivityRegionSelector({
  mode,
  regionOptions,
  regionMap,
  value,
  onChange,
  maxSelections = 5,
}: ActivityRegionSelectorProps) {
  const [expandedSidoCode, setExpandedSidoCode] = useState<string>('');

  const sidoOptions = useMemo(
    () => sortSido(regionOptions.filter((option) => option.regionLevel === 1 || !option.parentRegionCode)),
    [regionOptions],
  );

  const subRegions = useMemo(() => {
    const byParent = new Map<string, CodeLookupResponse[]>();
    for (const option of regionOptions) {
      if (!option.parentRegionCode) continue;
      const list = byParent.get(option.parentRegionCode) ?? [];
      list.push(option);
      byParent.set(option.parentRegionCode, list);
    }
    for (const list of byParent.values()) {
      list.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    }
    return byParent;
  }, [regionOptions]);

  function toggleCode(code: string): void {
    const already = isSelected(value, code);
    if (!already && value.length >= maxSelections) {
      return;
    }
    onChange(already ? value.filter((v) => v !== code) : [...value, code]);
  }

  function hasSelectedChild(parentCode: string): boolean {
    const children = subRegions.get(parentCode) ?? [];
    return children.some((child) => isSelected(value, child.code));
  }

  const listClass = mode === 'chip' ? 'mp-chip-group' : 'type-selector';
  const itemClass = mode === 'chip' ? 'mp-chip' : 'type-btn';
  const itemSelectedSuffix = mode === 'chip' ? ' mp-chip--selected' : ' selected';

  return (
    <div className="mp-region-selector">
      <div className={listClass}>
        {sidoOptions.map((region) => {
          const children = subRegions.get(region.code) ?? [];
          const expanded = expandedSidoCode === region.code;
          const selected = isSelected(value, region.code) || hasSelectedChild(region.code);

          return (
            <button
              key={region.code}
              type="button"
              className={`${itemClass}${selected ? itemSelectedSuffix : ''}`}
              aria-expanded={children.length > 0 ? expanded : undefined}
              onClick={() => {
                if (children.length > 0) {
                  setExpandedSidoCode((current) => (current === region.code ? '' : region.code));
                  return;
                }
                toggleCode(region.code);
              }}
            >
              {mode === 'chip' && selected ? `✓ ${region.name}` : region.name}
            </button>
          );
        })}
      </div>

      {expandedSidoCode && (subRegions.get(expandedSidoCode)?.length ?? 0) > 0 && (
        <div className="mp-subregion-panel">
          <div className="mp-subregion-title">{labelOf(regionMap, expandedSidoCode)}</div>
          <div className={listClass}>
            {(subRegions.get(expandedSidoCode) ?? []).map((subRegion) => (
              <button
                key={subRegion.code}
                type="button"
                className={`${itemClass}${isSelected(value, subRegion.code) ? itemSelectedSuffix : ''}${mode === 'chip' ? ' mp-chip--sub' : ''}`}
                onClick={() => toggleCode(subRegion.code)}
              >
                {mode === 'chip' && isSelected(value, subRegion.code) ? `✓ ${subRegion.name}` : subRegion.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

