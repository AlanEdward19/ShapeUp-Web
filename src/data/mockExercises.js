export const availableMuscles = [
    'Chest', 'Upper Chest', 'Back', 'Latissimus Dorsi', 'Rhomboids',
    'Shoulders', 'Front Delt', 'Side Delt', 'Rear Delt', 'Biceps',
    'Triceps', 'Quads', 'Hamstrings', 'Glutes', 'Calves', 'Core', 'Lower Back'
];

export const exercisesDB = [
    { id: 1, name: 'Barbell Bench Press', muscles: ['Chest', 'Triceps', 'Front Delt'], muscleActivations: { 'Chest': 1, 'Triceps': 0.5, 'Front Delt': 0.2 }, type: 'Compound', equipment: 'Barbell' },
    { id: 2, name: 'Incline Dumbbell Press', muscles: ['Upper Chest', 'Triceps', 'Front Delt'], muscleActivations: { 'Upper Chest': 1, 'Triceps': 0.5, 'Front Delt': 0.4 }, type: 'Compound', equipment: 'Dumbbell' },
    { id: 3, name: 'Cable Crossover', muscles: ['Chest'], muscleActivations: { 'Chest': 1, 'Upper Chest': 0.2 }, type: 'Isolation', equipment: 'Cable' },
    { id: 4, name: 'Barbell Squat', muscles: ['Quads', 'Glutes', 'Hamstrings'], muscleActivations: { 'Quads': 1, 'Glutes': 0.8, 'Hamstrings': 0.3, 'Lower Back': 0.2 }, type: 'Compound', equipment: 'Barbell' },
    { id: 5, name: 'Romanian Deadlift', muscles: ['Hamstrings', 'Glutes', 'Lower Back'], muscleActivations: { 'Hamstrings': 1, 'Glutes': 0.8, 'Lower Back': 0.6 }, type: 'Compound', equipment: 'Barbell' },
    { id: 6, name: 'Leg Extension', muscles: ['Quads'], muscleActivations: { 'Quads': 1 }, type: 'Isolation', equipment: 'Machine' },
    { id: 7, name: 'Pull Up', muscles: ['Latissimus Dorsi', 'Biceps', 'Rhomboids'], muscleActivations: { 'Latissimus Dorsi': 1, 'Biceps': 0.5, 'Rhomboids': 0.4 }, type: 'Compound', equipment: 'Bodyweight' },
    { id: 8, name: 'Seated Cable Row', muscles: ['Rhomboids', 'Latissimus Dorsi', 'Biceps'], muscleActivations: { 'Rhomboids': 1, 'Latissimus Dorsi': 0.8, 'Biceps': 0.5 }, type: 'Compound', equipment: 'Cable' },
    { id: 9, name: 'Overhead Press', muscles: ['Shoulders', 'Triceps'], muscleActivations: { 'Shoulders': 1, 'Triceps': 0.6, 'Front Delt': 1 }, type: 'Compound', equipment: 'Barbell' },
    { id: 10, name: 'Lateral Raise', muscles: ['Side Delt'], muscleActivations: { 'Side Delt': 1 }, type: 'Isolation', equipment: 'Dumbbell' },
];
