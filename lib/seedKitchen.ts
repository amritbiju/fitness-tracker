import { db } from './db';

const COMMON_FOODS = [
    // Proteins - Western
    { name: 'chicken', calories: 165, protein: 31, unit: 'g' as const },
    { name: 'egg', calories: 155, protein: 13, unit: 'g' as const },
    { name: 'whey protein', calories: 120, protein: 24, unit: 'scoop' as const },
    { name: 'greek yogurt', calories: 59, protein: 10, unit: 'g' as const },
    { name: 'tuna', calories: 132, protein: 28, unit: 'g' as const },
    { name: 'salmon', calories: 208, protein: 20, unit: 'g' as const },
    { name: 'beef', calories: 250, protein: 26, unit: 'g' as const },

    // Proteins - Indian
    { name: 'paneer', calories: 265, protein: 18, unit: 'g' as const },
    { name: 'dal', calories: 116, protein: 9, unit: 'g' as const },
    { name: 'moong dal', calories: 105, protein: 7, unit: 'g' as const },
    { name: 'rajma', calories: 127, protein: 8.7, unit: 'g' as const },
    { name: 'chole', calories: 164, protein: 8.9, unit: 'g' as const },
    { name: 'dahi', calories: 60, protein: 3.5, unit: 'g' as const },
    { name: 'mutton', calories: 294, protein: 25, unit: 'g' as const },
    { name: 'fish', calories: 206, protein: 22, unit: 'g' as const },

    // Carbs - Western
    { name: 'oats', calories: 389, protein: 17, unit: 'g' as const },
    { name: 'rice', calories: 130, protein: 2.7, unit: 'g' as const },
    { name: 'brown rice', calories: 112, protein: 2.6, unit: 'g' as const },
    { name: 'pasta', calories: 131, protein: 5, unit: 'g' as const },
    { name: 'bread', calories: 265, protein: 9, unit: 'g' as const },
    { name: 'potato', calories: 77, protein: 2, unit: 'g' as const },
    { name: 'sweet potato', calories: 86, protein: 1.6, unit: 'g' as const },

    // Carbs - Indian
    { name: 'roti', calories: 71, protein: 3, unit: 'unit' as const },
    { name: 'naan', calories: 262, protein: 9, unit: 'unit' as const },
    { name: 'paratha', calories: 126, protein: 3, unit: 'unit' as const },
    { name: 'aloo paratha', calories: 180, protein: 4, unit: 'unit' as const },
    { name: 'paneer paratha', calories: 210, protein: 8, unit: 'unit' as const },
    { name: 'gobi paratha', calories: 150, protein: 4, unit: 'unit' as const },
    { name: 'poha', calories: 76, protein: 1.8, unit: 'g' as const },
    { name: 'upma', calories: 85, protein: 2.5, unit: 'g' as const },
    { name: 'idli', calories: 39, protein: 2, unit: 'unit' as const },
    { name: 'dosa', calories: 133, protein: 4, unit: 'unit' as const },
    { name: 'samosa', calories: 262, protein: 4, unit: 'unit' as const },
    { name: 'pakora', calories: 150, protein: 3, unit: 'unit' as const },
    { name: 'biryani', calories: 200, protein: 6, unit: 'g' as const },
    { name: 'pulao', calories: 180, protein: 4, unit: 'g' as const },

    // Fats
    { name: 'peanut butter', calories: 588, protein: 25, unit: 'g' as const },
    { name: 'almonds', calories: 579, protein: 21, unit: 'g' as const },
    { name: 'walnuts', calories: 654, protein: 15, unit: 'g' as const },
    { name: 'cashews', calories: 553, protein: 18, unit: 'g' as const },
    { name: 'peanuts', calories: 567, protein: 26, unit: 'g' as const },
    { name: 'avocado', calories: 160, protein: 2, unit: 'g' as const },
    { name: 'ghee', calories: 900, protein: 0, unit: 'g' as const },
    { name: 'butter', calories: 717, protein: 0.9, unit: 'g' as const },
    { name: 'olive oil', calories: 884, protein: 0, unit: 'g' as const },

    // Fruits
    { name: 'banana', calories: 89, protein: 1.1, unit: 'unit' as const },
    { name: 'apple', calories: 52, protein: 0.3, unit: 'unit' as const },
    { name: 'orange', calories: 47, protein: 0.9, unit: 'unit' as const },
    { name: 'mango', calories: 60, protein: 0.8, unit: 'g' as const },
    { name: 'papaya', calories: 43, protein: 0.5, unit: 'g' as const },
    { name: 'watermelon', calories: 30, protein: 0.6, unit: 'g' as const },
    { name: 'grapes', calories: 69, protein: 0.7, unit: 'g' as const },

    // Drinks & Misc
    { name: 'milk', calories: 42, protein: 3.4, unit: 'g' as const },
    { name: 'lassi', calories: 59, protein: 2.9, unit: 'g' as const },
    { name: 'buttermilk', calories: 40, protein: 3.3, unit: 'g' as const },
    { name: 'monster energy', calories: 54, protein: 0, unit: 'g' as const },
    { name: 'red bull', calories: 45, protein: 0, unit: 'g' as const },
    { name: 'hummus', calories: 166, protein: 8, unit: 'g' as const },
    { name: 'pizza', calories: 266, protein: 11, unit: 'g' as const },
    { name: 'burger', calories: 295, protein: 17, unit: 'unit' as const },
    { name: 'sandwich', calories: 250, protein: 10, unit: 'unit' as const },
];

export async function seedKitchen() {
    const existingCount = await db.staples.count();

    // Only seed if kitchen is empty
    if (existingCount === 0) {
        await db.staples.bulkAdd(COMMON_FOODS);
        console.log('✅ Kitchen seeded with', COMMON_FOODS.length, 'common foods');
        return true;
    }

    return false;
}

// Helper function to clear duplicates
export async function clearDuplicates() {
    const allFoods = await db.staples.toArray();
    const seen = new Set<string>();
    const duplicates: number[] = [];

    allFoods.forEach(food => {
        if (seen.has(food.name)) {
            duplicates.push(food.id!);
        } else {
            seen.add(food.name);
        }
    });

    if (duplicates.length > 0) {
        await db.staples.bulkDelete(duplicates);
        console.log('🧹 Removed', duplicates.length, 'duplicate foods');
    }
}
