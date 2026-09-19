import { leafDisplayName, leavesFromMuscleGroup, resolveMuscleToken } from '../components/anatomy/muscleRegions';

export function getCatalogLanguage() {
    try {
        return localStorage.getItem('shapeup_language') || 'pt-BR';
    } catch {
        return 'pt-BR';
    }
}

const fold = (value) =>
    String(value || '')
        .normalize('NFD')
        .replace(/\p{M}/gu, '')
        .toLowerCase()
        .trim();

export function asList(value) {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.$values)) return value.$values;
    return [];
}

export function pageItems(payload) {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;
    for (const bag of [payload.items, payload.exercises, payload.data]) {
        const list = asList(bag);
        if (list.length || Array.isArray(bag) || Array.isArray(bag?.$values)) return list;
    }
    return asList(payload.$values);
}

export function pickLocalized(language, en, pt) {
    const english = String(en || '').trim();
    const portuguese = String(pt || '').trim();
    if (language === 'pt-BR') return portuguese || english;
    return english || portuguese;
}

export function muscleDisplayName(muscle, language) {
    if (muscle == null || muscle === '') return '';
    if (typeof muscle !== 'object') {
        const text = String(muscle).trim();
        const fromGroup = leavesFromMuscleGroup(text).map((id) => leafDisplayName(id, language));
        return fromGroup[0] || text;
    }
    const named = pickLocalized(
        language,
        muscle.muscleName || muscle.MuscleName || muscle.name || muscle.Name,
        muscle.muscleNamePt || muscle.MuscleNamePt || muscle.namePt || muscle.NamePt,
    );
    if (named) return named;
    return leavesFromMuscleGroup(muscle.muscleGroup ?? muscle.MuscleGroup)
        .map((id) => leafDisplayName(id, language))
        .join(' / ');
}

export function equipmentDisplayName(item, language) {
    if (item == null || item === '') return '';
    if (typeof item !== 'object') return String(item).trim();
    return pickLocalized(language, item.equipmentName || item.name, item.equipmentNamePt || item.namePt);
}

function rawMuscleList(ex) {
    const bags = [ex?.muscles, ex?.Muscles, ex?.exercise?.muscles, ex?.muscleGroups, ex?.muscleDetails];
    for (const bag of bags) {
        const list = asList(bag);
        if (list.length) return list;
    }
    return [];
}

export function localizeExercise(ex, language = getCatalogLanguage()) {
    if (!ex) return ex;
    const musclesRaw = rawMuscleList(ex);
    const muscles = [...new Set(musclesRaw.flatMap((m) => {
        const label = muscleDisplayName(m, language);
        return label ? label.split(' / ').map((part) => part.trim()).filter(Boolean) : [];
    }))];
    const nameEn = ex.name || ex.exerciseName || ex.exercise?.name || '';
    const namePt = ex.namePt || ex.exerciseNamePt || ex.exercise?.namePt || ex.exercise?.translatedName || '';
    const equipmentFromList = asList(ex.equipments)
        .map((item) => equipmentDisplayName(item, language))
        .filter(Boolean)
        .join(', ');
    return {
        ...ex,
        nameEn,
        namePt,
        name: pickLocalized(language, nameEn, namePt),
        muscles,
        equipment: pickLocalized(language, ex.equipment, ex.equipmentPt) || equipmentFromList || ex.equipment,
        muscleDetails: asList(ex.muscleDetails).length ? asList(ex.muscleDetails) : musclesRaw,
        muscleActivations: Object.fromEntries(
            musclesRaw
                .filter((m) => typeof m === 'object' && Number.isFinite(Number(m.activationPercent)))
                .map((m) => [muscleDisplayName(m, language) || String(m.muscleGroup), Number(m.activationPercent) / 100]),
        ),
    };
}

const exerciseMuscleLabels = (ex) => {
    const labels = [];
    const push = (value) => {
        if (value == null || value === '') return;
        if (typeof value === 'object') {
            push(value.muscleName);
            push(value.muscleNamePt);
            push(value.name);
            push(value.namePt);
            if (value.muscleGroup != null) push(String(value.muscleGroup));
            return;
        }
        String(value)
            .split(/[•|,/;]+/)
            .forEach((part) => {
                const trimmed = part.trim();
                if (trimmed) labels.push(trimmed);
            });
    };
    if (Array.isArray(ex?.muscles)) ex.muscles.forEach(push);
    else push(ex?.muscles);
    if (Array.isArray(ex?.muscleDetails)) ex.muscleDetails.forEach(push);
    return labels;
};

export function exerciseMatchesMuscleFilter(ex, selected) {
    if (!selected || selected === 'all') return true;
    const selectedFold = fold(selected);
    const labels = exerciseMuscleLabels(ex);
    if (labels.some((label) => {
        const labelFold = fold(label);
        return labelFold === selectedFold || labelFold.includes(selectedFold) || selectedFold.includes(labelFold);
    })) {
        return true;
    }
    const selectedLeaves = new Set(resolveMuscleToken(selected));
    if (selectedLeaves.size === 0) return false;
    return labels.some((label) => resolveMuscleToken(label).some((leaf) => selectedLeaves.has(leaf)));
}

export function exerciseMatchesAnyMuscle(ex, selectedMuscles) {
    if (!selectedMuscles?.length) return true;
    return selectedMuscles.some((muscle) => exerciseMatchesMuscleFilter(ex, muscle));
}
