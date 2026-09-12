import { useState, useEffect, useMemo } from 'react';
import { useTrainingApi } from './api/useTrainingApi';

/**
 * Custom hook for managing exercises: fetching, filtering and muscle selection.
 * Delegates API calls to useTrainingApi (Training domain hook).
 */
export const useExercises = () => {
    const { getExercises } = useTrainingApi();

    const [exercises, setExercises] = useState([]);
    const [availableMuscles, setAvailableMuscles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // Filtering states
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMuscles, setSelectedMuscles] = useState([]);

    // Fetch exercises via useTrainingApi
    useEffect(() => {
        const fetchExercises = async () => {
            try {
                const responseData = await getExercises();
                const pages = [...(Array.isArray(responseData) ? responseData : responseData?.data || responseData?.exercises || responseData?.items || [])];
                let cursor = responseData?.nextCursor;
                const seen = new Set();
                while (cursor && !seen.has(cursor)) {
                    seen.add(cursor);
                    const page = await getExercises(cursor);
                    pages.push(...(page.items || []));
                    cursor = page.nextCursor;
                }

                const rawData = pages;

                // Normalize results for the UI
                const data = rawData.map(ex => ({
                    ...ex,
                    muscleDetails: ex.muscles,
                    name: ex.namePt || ex.name,
                    muscles: Array.isArray(ex.muscles)
                        ? ex.muscles.map(m => typeof m === 'object' ? (m.muscleNamePt || m.muscleName) : m)
                        : []
                }));

                setExercises(data);

                // Dynamically extract unique muscles
                const muscleSet = new Set();
                data.forEach(ex => {
                    if (Array.isArray(ex.muscles)) {
                        ex.muscles.forEach(m => muscleSet.add(m));
                    }
                });
                setAvailableMuscles(Array.from(muscleSet).sort());
            } catch (error) {
                console.error("Falha ao buscar exercícios da API.", error);
                setError(true);
                setExercises([]);
                setAvailableMuscles([]);
            } finally {
                setLoading(false);
            }
        };

        fetchExercises();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Filter logic memoized to avoid unnecessary re-calculations
    const filteredExercises = useMemo(() => {
        return exercises.filter(ex => {
            const matchesSearch = [ex.name, ...ex.muscles, ex.equipment, ...(ex.equipments || []).map(item => item.equipmentNamePt || item.equipmentName)].filter(Boolean).join(' ').toLowerCase().includes(searchTerm.toLowerCase());
            const matchesMuscle = selectedMuscles.length === 0 || selectedMuscles.some(m => ex.muscles.includes(m));
            return matchesSearch && matchesMuscle;
        });
    }, [exercises, searchTerm, selectedMuscles]);

    const toggleMuscle = (muscle) => {
        if (selectedMuscles.includes(muscle)) {
            setSelectedMuscles(selectedMuscles.filter(m => m !== muscle));
        } else {
            setSelectedMuscles([...selectedMuscles, muscle]);
        }
    };

    const clearFilters = () => {
        setSelectedMuscles([]);
    };

    return {
        exercises,
        filteredExercises,
        loading,
        error,
        searchTerm,
        setSearchTerm,
        selectedMuscles,
        toggleMuscle,
        clearFilters,
        availableMuscles
    };
};
