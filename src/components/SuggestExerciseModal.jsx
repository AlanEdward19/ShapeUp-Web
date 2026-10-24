import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTrainingApi } from '../hooks/api/useTrainingApi';
import { EXERCISE_KINDS, exerciseKindLabel } from '../utils/exerciseCatalog';
import { MUSCLE_GROUPS, groupDisplayName } from './anatomy/muscleRegions';
import './SuggestExerciseModal.css';

const copy = {
    'pt-BR': {
        title: 'Pedir um exercício',
        subtitle: 'Sentiu falta de algum exercício? Peça a inclusão e a equipe do ShapeUp cadastra depois de analisar.',
        tabNew: 'Novo pedido',
        tabMine: 'Meus pedidos',
        name: 'Nome do exercício',
        namePh: 'Ex.: Agachamento hack com pausa',
        type: 'Tipo',
        muscles: 'Músculos trabalhados',
        equipment: 'Equipamento',
        equipmentOther: 'Outro equipamento',
        notes: 'Como é feito e por que falta',
        notesPh: 'Descreva a execução e por que ele faz falta na biblioteca.',
        link: 'Vídeo ou link de referência (opcional)',
        send: 'Enviar pedido',
        sending: 'Enviando…',
        cancel: 'Cancelar',
        close: 'Fechar',
        errName: 'Informe o nome do exercício.',
        errMuscles: 'Escolha pelo menos um grupo muscular.',
        errSend: 'Não foi possível enviar o pedido. Tente novamente.',
        sentTitle: 'Pedido enviado',
        sentBody: (name) => `Recebemos o pedido de "${name}". Você acompanha o andamento em Meus pedidos.`,
        done: 'Concluir',
        another: 'Fazer outro pedido',
        empty: 'Você ainda não fez nenhum pedido.',
        loading: 'Carregando…',
        loadErr: 'Não foi possível carregar seus pedidos.',
        status: { Pending: 'Em análise', Approved: 'Aprovado', Rejected: 'Não aprovado' },
        inLibrary: (name) => `Já está na biblioteca como "${name}".`,
        reason: 'Motivo',
    },
    en: {
        title: 'Request an exercise',
        subtitle: 'Missing an exercise? Ask for it and the ShapeUp team adds it after reviewing.',
        tabNew: 'New request',
        tabMine: 'My requests',
        name: 'Exercise name',
        namePh: 'E.g. Paused hack squat',
        type: 'Type',
        muscles: 'Muscles worked',
        equipment: 'Equipment',
        equipmentOther: 'Other equipment',
        notes: 'How it is done and why it is missing',
        notesPh: 'Describe the movement and why the library needs it.',
        link: 'Video or reference link (optional)',
        send: 'Send request',
        sending: 'Sending…',
        cancel: 'Cancel',
        close: 'Close',
        errName: 'Enter the exercise name.',
        errMuscles: 'Choose at least one muscle group.',
        errSend: 'Could not send the request. Try again.',
        sentTitle: 'Request sent',
        sentBody: (name) => `We received your request for "${name}". Follow it under My requests.`,
        done: 'Done',
        another: 'Make another request',
        empty: 'You have not made any request yet.',
        loading: 'Loading…',
        loadErr: 'Could not load your requests.',
        status: { Pending: 'In review', Approved: 'Approved', Rejected: 'Not approved' },
        inLibrary: (name) => `It is now in the library as "${name}".`,
        reason: 'Reason',
    },
    es: {
        title: 'Pedir un ejercicio',
        subtitle: '¿Te falta un ejercicio? Pídelo y el equipo de ShapeUp lo agrega tras revisarlo.',
        tabNew: 'Nuevo pedido',
        tabMine: 'Mis pedidos',
        name: 'Nombre del ejercicio',
        namePh: 'Ej.: Sentadilla hack con pausa',
        type: 'Tipo',
        muscles: 'Músculos trabajados',
        equipment: 'Equipamiento',
        equipmentOther: 'Otro equipamiento',
        notes: 'Cómo se hace y por qué falta',
        notesPh: 'Describe el movimiento y por qué falta en la biblioteca.',
        link: 'Video o enlace de referencia (opcional)',
        send: 'Enviar pedido',
        sending: 'Enviando…',
        cancel: 'Cancelar',
        close: 'Cerrar',
        errName: 'Escribe el nombre del ejercicio.',
        errMuscles: 'Elige al menos un grupo muscular.',
        errSend: 'No se pudo enviar el pedido. Inténtalo de nuevo.',
        sentTitle: 'Pedido enviado',
        sentBody: (name) => `Recibimos tu pedido de "${name}". Síguelo en Mis pedidos.`,
        done: 'Listo',
        another: 'Hacer otro pedido',
        empty: 'Aún no has hecho ningún pedido.',
        loading: 'Cargando…',
        loadErr: 'No se pudieron cargar tus pedidos.',
        status: { Pending: 'En revisión', Approved: 'Aprobado', Rejected: 'No aprobado' },
        inLibrary: (name) => `Ya está en la biblioteca como "${name}".`,
        reason: 'Motivo',
    },
};

const KINDS = EXERCISE_KINDS.filter((kind) => kind !== 'all');
const itemsOf = (page) => (Array.isArray(page) ? page : page?.items ?? page?.Items ?? []);

const emptyForm = { name: '', kind: 'weight', muscleGroups: [], equipmentIds: [], equipmentOther: '', notes: '', referenceUrl: '' };

const SuggestExerciseModal = ({ onClose }) => {
    const { language } = useLanguage();
    const c = copy[language] || copy['pt-BR'];
    const { createExerciseRequest, listMyExerciseRequests, getEquipments } = useTrainingApi();
    const [tab, setTab] = useState('new');
    const [form, setForm] = useState(emptyForm);
    const [equipments, setEquipments] = useState([]);
    const [error, setError] = useState('');
    const [sending, setSending] = useState(false);
    const [sentName, setSentName] = useState('');
    const [mine, setMine] = useState(null);
    const [mineError, setMineError] = useState(false);

    useEffect(() => {
        let active = true;
        Promise.resolve(getEquipments(undefined, 100))
            .then((page) => { if (active) setEquipments(itemsOf(page)); })
            .catch(() => {});
        return () => { active = false; };
    }, [getEquipments]);

    useEffect(() => {
        if (tab !== 'mine') return undefined;
        let active = true;
        setMine(null);
        setMineError(false);
        Promise.resolve(listMyExerciseRequests())
            .then((page) => { if (active) setMine(itemsOf(page)); })
            .catch(() => { if (active) setMineError(true); });
        return () => { active = false; };
    }, [tab, listMyExerciseRequests, sentName]);

    const set = (patch) => { setForm((current) => ({ ...current, ...patch })); setError(''); };
    const toggle = (field, value) => set({ [field]: form[field].includes(value) ? form[field].filter((item) => item !== value) : [...form[field], value] });

    const submit = async (event) => {
        event.preventDefault();
        if (!form.name.trim()) { setError(c.errName); return; }
        if (form.kind !== 'cardio' && form.muscleGroups.length === 0) { setError(c.errMuscles); return; }
        setSending(true);
        try {
            await createExerciseRequest({
                name: form.name.trim(),
                kind: form.kind,
                exerciseType: form.kind === 'weight' ? 'weightBased' : 'timeBased',
                muscleGroups: form.muscleGroups,
                equipmentIds: form.equipmentIds,
                equipmentOther: form.equipmentOther.trim() || null,
                notes: form.notes.trim() || null,
                referenceUrl: form.referenceUrl.trim() || null,
            });
            setSentName(form.name.trim());
            setForm(emptyForm);
        } catch (err) {
            setError(err?.message || c.errSend);
        } finally {
            setSending(false);
        }
    };

    const equipmentName = (item) => (language === 'pt-BR' ? item.namePt || item.name : item.name || item.namePt);

    return (
        <div className="se-overlay" onClick={onClose}>
            <div className="se-sheet" role="dialog" aria-modal="true" aria-label={c.title} onClick={(event) => event.stopPropagation()}>
                <header className="se-head">
                    <div>
                        <h2>{c.title}</h2>
                        <p>{c.subtitle}</p>
                    </div>
                    <button type="button" className="se-close" onClick={onClose} aria-label={c.close}>×</button>
                </header>

                <div className="se-tabs" role="tablist">
                    <button type="button" role="tab" aria-selected={tab === 'new'} onClick={() => { setTab('new'); setSentName(''); }}>{c.tabNew}</button>
                    <button type="button" role="tab" aria-selected={tab === 'mine'} onClick={() => setTab('mine')} data-testid="se-tab-mine">{c.tabMine}</button>
                </div>

                {tab === 'new' && sentName && (
                    <div className="se-sent" data-testid="exercise-request-sent">
                        <h3>{c.sentTitle}</h3>
                        <p>{c.sentBody(sentName)}</p>
                        <div className="se-actions">
                            <button type="button" className="se-soft" onClick={() => setSentName('')}>{c.another}</button>
                            <button type="button" className="se-solid" onClick={onClose}>{c.done}</button>
                        </div>
                    </div>
                )}

                {tab === 'new' && !sentName && (
                    <form className="se-form" onSubmit={submit} data-testid="exercise-request-form">
                        <label className="se-field">
                            <span>{c.name}</span>
                            <input value={form.name} onChange={(event) => set({ name: event.target.value })} placeholder={c.namePh} maxLength={160} autoFocus />
                        </label>

                        <div className="se-field" role="group" aria-label={c.type}>
                            <span>{c.type}</span>
                            <div className="se-segmented">
                                {KINDS.map((kind) => (
                                    <button key={kind} type="button" aria-pressed={form.kind === kind} onClick={() => set({ kind })}>
                                        {exerciseKindLabel(kind, language)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {form.kind !== 'cardio' && (
                            <div className="se-field" role="group" aria-label={c.muscles}>
                                <span>{c.muscles}</span>
                                <div className="se-chips">
                                    {Object.keys(MUSCLE_GROUPS).map((group) => (
                                        <button key={group} type="button" aria-pressed={form.muscleGroups.includes(group)} onClick={() => toggle('muscleGroups', group)}>
                                            {groupDisplayName(group, language)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="se-field" role="group" aria-label={c.equipment}>
                            <span>{c.equipment}</span>
                            <div className="se-chips">
                                {equipments.map((item) => (
                                    <button key={item.id} type="button" aria-pressed={form.equipmentIds.includes(item.id)} onClick={() => toggle('equipmentIds', item.id)}>
                                        {equipmentName(item)}
                                    </button>
                                ))}
                            </div>
                            <input value={form.equipmentOther} onChange={(event) => set({ equipmentOther: event.target.value })} placeholder={c.equipmentOther} maxLength={120} />
                        </div>

                        <label className="se-field">
                            <span>{c.notes}</span>
                            <textarea rows={3} value={form.notes} onChange={(event) => set({ notes: event.target.value })} placeholder={c.notesPh} maxLength={1000} />
                        </label>

                        <label className="se-field">
                            <span>{c.link}</span>
                            <input type="url" inputMode="url" value={form.referenceUrl} onChange={(event) => set({ referenceUrl: event.target.value })} placeholder="https://" maxLength={300} />
                        </label>

                        {error && <p className="se-error" role="alert">{error}</p>}

                        <div className="se-actions">
                            <button type="button" className="se-soft" onClick={onClose}>{c.cancel}</button>
                            <button type="submit" className="se-solid" disabled={sending} data-testid="exercise-request-send">{sending ? c.sending : c.send}</button>
                        </div>
                    </form>
                )}

                {tab === 'mine' && (
                    <div className="se-mine" data-testid="exercise-request-mine">
                        {mineError && <p className="se-error" role="alert">{c.loadErr}</p>}
                        {!mineError && mine === null && <p className="se-muted">{c.loading}</p>}
                        {mine && mine.length === 0 && <p className="se-muted">{c.empty}</p>}
                        <ul>
                            {(mine || []).map((request) => (
                                <li key={request.id} data-status={request.status}>
                                    <div>
                                        <strong>{request.name}</strong>
                                        <span className="se-badge" data-status={request.status}>{c.status[request.status] || request.status}</span>
                                    </div>
                                    {request.status === 'Approved' && request.exerciseName && <small>{c.inLibrary(request.exerciseName)}</small>}
                                    {request.status === 'Rejected' && request.rejectionReason && <small>{c.reason}: {request.rejectionReason}</small>}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SuggestExerciseModal;
