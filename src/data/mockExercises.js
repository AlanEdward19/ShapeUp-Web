export const availableMuscles = [
    'Chest', 'Upper Chest', 'Back', 'Latissimus Dorsi', 'Rhomboids',
    'Shoulders', 'Front Delt', 'Side Delt', 'Rear Delt', 'Biceps',
    'Triceps', 'Quads', 'Hamstrings', 'Glutes', 'Calves', 'Core', 'Lower Back'
];

export const exercisesDB = [
    { id: 1, name: 'Barbell Bench Press', muscles: ['Chest', 'Triceps', 'Front Delt'], type: 'Compound', equipment: 'Barbell' },
    { id: 2, name: 'Incline Dumbbell Press', muscles: ['Upper Chest', 'Triceps', 'Front Delt'], type: 'Compound', equipment: 'Dumbbell' },
    { id: 3, name: 'Cable Crossover', muscles: ['Chest'], type: 'Isolation', equipment: 'Cable' },
    { id: 4, name: 'Barbell Squat', muscles: ['Quads', 'Glutes', 'Hamstrings'], type: 'Compound', equipment: 'Barbell' },
    { id: 5, name: 'Romanian Deadlift', muscles: ['Hamstrings', 'Glutes', 'Lower Back'], type: 'Compound', equipment: 'Barbell' },
    { id: 6, name: 'Leg Extension', muscles: ['Quads'], type: 'Isolation', equipment: 'Machine' },
    { id: 7, name: 'Pull Up', muscles: ['Latissimus Dorsi', 'Biceps', 'Rhomboids'], type: 'Compound', equipment: 'Bodyweight' },
    { id: 8, name: 'Seated Cable Row', muscles: ['Rhomboids', 'Latissimus Dorsi', 'Biceps'], type: 'Compound', equipment: 'Cable' },
    { id: 9, name: 'Overhead Press', muscles: ['Shoulders', 'Triceps'], type: 'Compound', equipment: 'Barbell' },
    { id: 10, name: 'Lateral Raise', muscles: ['Side Delt'], type: 'Isolation', equipment: 'Dumbbell' },
];
