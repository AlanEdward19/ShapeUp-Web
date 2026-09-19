export function persistDiaryEntryWithFastingWarning({
    addDiaryEntry,
    getClock,
    setWarning,
    command,
}) {
    const id = addDiaryEntry(command);
    void getClock()
        .then((snapshot) => {
            if (snapshot?.clock?.status === 'Fasting') setWarning(true);
        })
        .catch(() => {});
    return id;
}
