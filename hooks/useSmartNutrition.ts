'use client';

import { useState, useEffect } from 'react';
import { db, StapleFood } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { format } from 'date-fns';

// Helper to parse "200g chicken" or "2 scoops whey"
function parseInput(text: string) {
    // Regex for Quantity + Unit + Name
    // e.g. "200g chicken", "200 g chicken", "2 scoops whey"
    const regex = /^(\d+(?:\.\d+)?)\s*(g|oz|ml|scoops?|units?|pcs?)?\s+(.+)$/i;
    const match = text.match(regex);

    if (match) {
        return {
            qty: parseFloat(match[1]),
            unit: match[2]?.toLowerCase() || 'unit',
            name: match[3].trim().toLowerCase()
        };
    }

    // Fallback: just name
    return { qty: 1, unit: 'unit', name: text.trim().toLowerCase() };
}

export function useSmartNutrition() {
    const [input, setInput] = useState('');
    const [suggestions, setSuggestions] = useState<StapleFood[]>([]);

    const staples = useLiveQuery(() => db.staples.toArray()) || [];

    useEffect(() => {
        if (!input) {
            setSuggestions([]);
            return;
        }

        const parsed = parseInput(input);
        const matches = staples.filter(s => s.name.toLowerCase().includes(parsed.name));
        setSuggestions(matches.slice(0, 3)); // Top 3 suggestions
    }, [input, staples]);

    const createStaple = async (name: string, calories: number, protein: number, unit: 'g' | 'unit' | 'scoop') => {
        await db.staples.add({ name: name.toLowerCase(), calories, protein, unit });
    };

    const addLog = async () => {
        if (!input) return null;

        const parsed = parseInput(input);
        const today = format(new Date(), 'yyyy-MM-dd');

        // Check if we have a staple match for macros
        const staple = staples.find(s => s.name.toLowerCase() === parsed.name);

        let calories = 0;
        let protein = 0;

        if (staple) {
            // Calculate based on ratio
            // If staple is per 100g, and input is 200g -> 2x
            let ratio = 1;
            if (staple.unit === 'g' && parsed.unit === 'g') {
                ratio = parsed.qty / 100;
            } else if (staple.unit === 'scoop' && parsed.unit.includes('scoop')) {
                ratio = parsed.qty;
            } else {
                // Simple multiplication for units
                ratio = parsed.qty;
            }

            calories = Math.round(staple.calories * ratio);
            protein = Math.round(staple.protein * ratio);
        }

        await db.nutrition.add({
            date: today,
            itemName: parsed.name,
            quantity: `${parsed.qty}${parsed.unit}`,
            calories,
            protein,
            synced: false
        });

        setInput('');
        setSuggestions([]);

        return { calories, protein };
    };

    return {
        input,
        setInput,
        suggestions,
        addLog,
        createStaple
    };
}
