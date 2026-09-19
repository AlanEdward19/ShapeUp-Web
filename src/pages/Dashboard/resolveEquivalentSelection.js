export async function resolveEquivalentSelection({
  exerciseId,
  exerciseLookup,
  getExerciseById,
  mapExerciseEquivalents,
  inspect,
  setNotice,
  missingNotice = 'Exercício não encontrado na lista atual',
  inspectEventTarget,
}) {
  if (exerciseId == null) {
    setNotice(missingNotice);
    return;
  }
  const fromLookup = exerciseLookup.find((item) => String(item.id) === String(exerciseId));
  const target = inspectEventTarget;
  if (fromLookup) {
    inspect(fromLookup, { currentTarget: target });
    return;
  }
  try {
    const remote = await getExerciseById(exerciseId);
    const { records } = mapExerciseEquivalents(remote?.id != null ? [remote] : []);
    if (records[0]) {
      inspect(records[0], { currentTarget: target });
      return;
    }
  } catch {
    /* toast below */
  }
  setNotice(missingNotice);
}
