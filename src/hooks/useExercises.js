import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTrainingApi } from './api/useTrainingApi';
import {
    exerciseMatchesAnyMuscle,
    getCatalogLanguage,
    localizeExercise,
    pageItems,
    pickLocalized,
} from '../utils/exerciseCatalog';

/**
 * Custom hook for managing exercises: fetching, filtering and muscle selection.
 * Delegates API calls to useTrainingApi (Training domain hook).
 */
export const useExercises = () => {
    const { getExercises } = useTrainingApi();
    const language = useLanguage()?.language || getCatalogLanguage();

    const [rawExercises, setRawExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMuscles, setSelectedMuscles] = useState([]);

    useEffect(() => {
        const fetchExercises = async () => {
            try {
                const responseData = await getExercises();
                const pages = [...pageItems(responseData)];
                let cursor = responseData?.nextCursor;
                const seen = new Set();
                while (cursor && !seen.has(cursor)) {
                    seen.add(cursor);
                    const page = await getExercises(cursor);
                    pages.push(...pageItems(page));
                    cursor = page.nextCursor;
                }
                setRawExercises(pages);
            } catch (err) {
                console.error('Falha ao buscar exercícios da API.', err);
                setError(true);
                setRawExercises([]);
            } finally {
                setLoading(false);
            }
        };

        fetchExercises();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const exercises = useMemo(
        () => rawExercises.map((ex) => localizeExercise(ex, language)),
        [rawExercises, language],
    );

    const availableMuscles = useMemo(() => {
        const muscleSet = new Set();
        exercises.forEach((ex) => {
            (ex.muscles || []).filter(Boolean).forEach((m) => muscleSet.add(m));
        });
        return Array.from(muscleSet).sort((a, b) => a.localeCompare(b));
    }, [exercises]);

    const filteredExercises = useMemo(() => {
        const query = searchTerm.toLowerCase();
        return exercises.filter((ex) => {
            const equipmentHaystack = [
                ex.equipment,
                ...(ex.equipments || []).map((item) => pickLocalized(language, item.equipmentName, item.equipmentNamePt)),
            ];
            const matchesSearch = [ex.name, ex.nameEn, ex.namePt, ...ex.muscles, ...equipmentHaystack]
                .filter(Boolean)
                .join(' ')
                .toLowerCase()
                .includes(query);
            return matchesSearch && exerciseMatchesAnyMuscle(ex, selectedMuscles);
        });
    }, [exercises, searchTerm, selectedMuscles, language]);

    const toggleMuscle = (muscle) => {
        if (selectedMuscles.includes(muscle)) {
            setSelectedMuscles(selectedMuscles.filter((m) => m !== muscle));
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
        availableMuscles,
    };
};
