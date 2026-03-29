import { useState, useEffect, useMemo } from 'react';
import { apiClient } from '../services/apiClient';

/**
 * Custom hook for managing exercises: fetching, filtering and muscle selection.
 */
export const useExercises = () => {
    const [exercises, setExercises] = useState([]);
    const [availableMuscles, setAvailableMuscles] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filtering states
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMuscles, setSelectedMuscles] = useState([]);

    // Fetch exercises via apiClient
    useEffect(() => {
        const fetchExercises = async () => {
            try {
                const responseData = await apiClient('/api/training/exercises');
                
                const rawData = Array.isArray(responseData) 
                    ? responseData 
                    : (responseData?.data || responseData?.exercises || responseData?.items || []);

                // Normalize results for the UI
                const data = rawData.map(ex => ({
                    ...ex,
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
                setExercises([]);
                setAvailableMuscles([]);
            } finally {
                setLoading(false);
            }
        };

        fetchExercises();
    }, []);

    // Filter logic memoized to avoid unnecessary re-calculations
    const filteredExercises = useMemo(() => {
        return exercises.filter(ex => {
            const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase());
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
        searchTerm,
        setSearchTerm,
        selectedMuscles,
        toggleMuscle,
        clearFilters,
        availableMuscles
    };
};
