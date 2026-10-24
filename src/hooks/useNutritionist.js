import { useEffect, useState } from 'react';
import { asList, listNutritionists } from '../services/parityClient';

/**
 * Whether the user has a linked nutritionist. A linked user cannot change the goal or
 * restructure the meal plan: the nutritionist owns both.
 */
export default function useNutritionist() {
    const [state, setState] = useState({ linked: false, loading: true });

    useEffect(() => {
        let active = true;
        listNutritionists()
            .then((rows) => { if (active) setState({ linked: asList(rows).length > 0, loading: false }); })
            .catch(() => { if (active) setState({ linked: false, loading: false }); });
        return () => { active = false; };
    }, []);

    return state;
}
