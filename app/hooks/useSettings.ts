'use client';

import { useState, useCallback } from "react";

export interface RangeConfig {
  min: number;
  max: number;
}

export interface RangeSettings {
  multiplierA: RangeConfig;
  multiplierB: RangeConfig;
  divisor: RangeConfig;
  quotient: RangeConfig;
}

const DEFAULT_SETTINGS: RangeSettings = {
  multiplierA: { min: 1, max: 100 },
  multiplierB: { min: 1, max: 100 },
  divisor: { min: 1, max: 100 },
  quotient: { min: 1, max: 100 },
};

const STORAGE_KEY = "multiply-divide-settings";
const MIN_VAL = 1;
const MAX_VAL = 1000;

function clamp(value: number): number {
  return Math.max(MIN_VAL, Math.min(MAX_VAL, value));
}

function loadSettings(): RangeSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as RangeSettings;
      // Validate all fields exist and are in range
      const keys = Object.keys(DEFAULT_SETTINGS) as (keyof RangeSettings)[];
      for (const key of keys) {
        if (!parsed[key] || typeof parsed[key].min !== 'number' || typeof parsed[key].max !== 'number') {
          return DEFAULT_SETTINGS;
        }
      }
      // Clamp loaded values and fix inverted ranges
      for (const key of keys) {
        let r = { min: clamp(parsed[key].min), max: clamp(parsed[key].max) };
        if (r.min > r.max) {
          [r.min, r.max] = [r.max, r.min];
        }
        parsed[key] = r;
      }
      return parsed;
    }
  } catch {
    // localStorage unavailable or JSON parse error — silent fallback
  }
  return DEFAULT_SETTINGS;
}

function saveSettings(settings: RangeSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // localStorage unavailable — silent fallback
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<RangeSettings>(loadSettings);

  const updateRange = useCallback(
    (key: keyof RangeSettings, field: "min" | "max", value: number) => {
      setSettings((prev) => {
        const clamped = clamp(value);
        const range = { ...prev[key], [field]: clamped };

        // Auto-swap if min > max
        if (range.min > range.max) {
          const temp = range.min;
          range.min = range.max;
          range.max = temp;
        }

        const next = { ...prev, [key]: range };
        saveSettings(next);
        return next;
      });
    },
    []
  );

  return { settings, updateRange };
}
