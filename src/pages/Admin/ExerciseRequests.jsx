import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTrainingApi } from '../../hooks/api/useTrainingApi';
import { MUSCLE_GROUPS, groupDisplayName, leafDisplayName } from '../../components/anatomy/muscleRegions';
import { exerciseKindLabel } from '../../utils/exerciseCatalog';
import { buildApproveBody, groupLeaves } from './exerciseRequestBody';
import './ExerciseRequests.css';

const copy = {
    'pt-BR': {
        kicker: 'Catálogo',
        title: 'Solicitações de exercícios',
        back: 'Administração',
        filters: { Pending: 'Pendentes', Approved: 'Aprovadas', Rejected: 'Recusadas', all: 'Todas' },
        empty: 'Nenhuma solicitação nesta lista.',
        pick: 'Escolha uma solicitação para analisar.',
        loading: 'Carregando…',
        loadErr: 'Não foi possível carregar as solicitações.',
        status: { Pending: 'Pendente', Approved: 'Aprovada', Rejected: 'Recusada' },
        requestedBy: 'Pedido por',
        on: 'em',
        type: 'Tipo',
        muscles: 'Músculos indicados',
        equipment: 'Equipamento indicado',
        notes: 'Descrição do pedido',
        reference: 'Referência',
        none: 'Nada informado',
        linked: 'Exercício cadastrado',
        reviewedBy: 'Analisado por',
        reason: 'Motivo da recusa',
        formTitle: 'Cadastrar exercício a partir deste pedido',
        formHint: 'Preencha tudo que o sistema precisa. O exercício fica vinculado a este pedido para auditoria.',
        name: 'Nome (inglês)',
        namePt: 'Nome (português)',
        description: 'Descrição',
        video: 'Link do vídeo',
        exerciseType: 'Tipo de exercício',
        weightBased: 'Por carga e repetições',
        timeBased: 'Por tempo',
        musclesField: 'Músculos e ativação',
        activation: 'Ativação %',
        equipmentField: 'Equipamentos',
        steps: 'Passo a passo',
        addStep: 'Adicionar passo',
        removeStep: 'Remover passo',
        adminNote: 'Observação interna (opcional)',
        approve: 'Cadastrar e aprovar',
        saving: 'Salvando…',
        rejectTitle: 'Recusar pedido',
        rejectReason: 'Motivo (quem pediu vai ler)',
        rejectCta: 'Recusar',
        errNames: 'Preencha o nome em inglês e em português.',
        errMuscles: 'Escolha pelo menos um músculo.',
        errActivation: 'A ativação de cada músculo deve ficar entre 1 e 100.',
        errReason: 'Informe o motivo da recusa.',
        errSave: 'Não foi possível concluir. Tente novamente.',
    },
    en: {
        kicker: 'Catalog',
        title: 'Exercise requests',
        back: 'Administration',
        filters: { Pending: 'Pending', Approved: 'Approved', Rejected: 'Rejected', all: 'All' },
        empty: 'No requests in this list.',
        pick: 'Pick a request to review.',
        loading: 'Loading…',
        loadErr: 'Could not load the requests.',
        status: { Pending: 'Pending', Approved: 'Approved', Rejected: 'Rejected' },
        requestedBy: 'Requested by',
        on: 'on',
        type: 'Type',
        muscles: 'Suggested muscles',
        equipment: 'Suggested equipment',
        notes: 'Request description',
        reference: 'Reference',
        none: 'Nothing provided',
        linked: 'Registered exercise',
        reviewedBy: 'Reviewed by',
        reason: 'Reason for rejection',
        formTitle: 'Register an exercise from this request',
        formHint: 'Fill in everything the system needs. The exercise stays linked to this request for auditing.',
        name: 'Name (English)',
        namePt: 'Name (Portuguese)',
        description: 'Description',
        video: 'Video link',
        exerciseType: 'Exercise type',
        weightBased: 'Weight and reps',
        timeBased: 'Timed',
        musclesField: 'Muscles and activation',
        activation: 'Activation %',
        equipmentField: 'Equipment',
        steps: 'Step by step',
        addStep: 'Add step',
        removeStep: 'Remove step',
        adminNote: 'Internal note (optional)',
        approve: 'Register and approve',
        saving: 'Saving…',
        rejectTitle: 'Reject request',
        rejectReason: 'Reason (the requester reads this)',
        rejectCta: 'Reject',
        errNames: 'Fill in the English and Portuguese names.',
        errMuscles: 'Choose at least one muscle.',
        errActivation: 'Each muscle activation must be between 1 and 100.',
        errReason: 'Enter the reason for rejecting.',
        errSave: 'Could not finish. Try again.',
    },
    es: {
        kicker: 'Catálogo',
        title: 'Solicitudes de ejercicios',
        back: 'Administración',
        filters: { Pending: 'Pendientes', Approved: 'Aprobadas', Rejected: 'Rechazadas', all: 'Todas' },
        empty: 'No hay solicitudes en esta lista.',
        pick: 'Elige una solicitud para revisar.',
        loading: 'Cargando…',
        loadErr: 'No se pudieron cargar las solicitudes.',
        status: { Pending: 'Pendiente', Approved: 'Aprobada', Rejected: 'Rechazada' },
        requestedBy: 'Pedido por',
        on: 'el',
        type: 'Tipo',
        muscles: 'Músculos indicados',
        equipment: 'Equipamiento indicado',
        notes: 'Descripción del pedido',
        reference: 'Referencia',
        none: 'Sin información',
        linked: 'Ejercicio registrado',
        reviewedBy: 'Revisado por',
        reason: 'Motivo del rechazo',
        formTitle: 'Registrar un ejercicio desde este pedido',
        formHint: 'Completa todo lo que el sistema necesita. El ejercicio queda vinculado a este pedido para auditoría.',
        name: 'Nombre (inglés)',
        namePt: 'Nombre (portugués)',
        description: 'Descripción',
        video: 'Enlace del video',
        exerciseType: 'Tipo de ejercicio',
        weightBased: 'Carga y repeticiones',
        timeBased: 'Por tiempo',
        musclesField: 'Músculos y activación',
        activation: 'Activación %',
        equipmentField: 'Equipamientos',
        steps: 'Paso a paso',
        addStep: 'Agregar paso',
        removeStep: 'Quitar paso',
        adminNote: 'Nota interna (opcional)',
        approve: 'Registrar y aprobar',
        saving: 'Guardando…',
        rejectTitle: 'Rechazar pedido',
        rejectReason: 'Motivo (quien lo pidió lo lee)',
        rejectCta: 'Rechazar',
        errNames: 'Completa el nombre en inglés y en portugués.',
        errMuscles: 'Elige al menos un músculo.',
        errActivation: 'La activación de cada músculo debe estar entre 1 y 100.',
        errReason: 'Escribe el motivo del rechazo.',
        errSave: 'No se pudo completar. Inténtalo de nuevo.',
    },
};

const itemsOf = (page) => (Array.isArray(page) ? page : page?.items ?? page?.Items ?? []);
const initialForm = (request) => ({
    name: request.name || '',
    namePt: request.name || '',
    description: request.notes || '',
    videoUrl: request.referenceUrl || '',
    exerciseType: request.exerciseType === 'timeBased' || request.exerciseType === 'TimeBased' ? 'timeBased' : 'weightBased',
    leaves: groupLeaves(request.muscleGroups).slice(0, 3),
    activation: {},
    equipmentIds: request.equipmentIds || [],
    steps: [''],
    adminNote: '',
});

function RequestForm({ request, equipments, c, language, busy, error, onApprove, onReject }) {
    const [form, setForm] = useState(() => initialForm(request));
    const [reason, setReason] = useState('');
    const [localError, setLocalError] = useState('');
    const set = (patch) => { setForm((current) => ({ ...current, ...patch })); setLocalError(''); };
    const toggle = (field, value) => set({ [field]: form[field].includes(value) ? form[field].filter((item) => item !== value) : [...form[field], value] });
    const setStep = (index, value) => set({ steps: form.steps.map((step, i) => (i === index ? value : step)) });

    const submit = (event) => {
        event.preventDefault();
        if (!form.name.trim() || !form.namePt.trim()) { setLocalError(c.errNames); return; }
        if (form.leaves.length === 0 && request.kind !== 'cardio') { setLocalError(c.errMuscles); return; }
        if (form.leaves.some((leaf) => { const value = Number(form.activation[leaf] ?? 100); return !(value >= 1 && value <= 100); })) { setLocalError(c.errActivation); return; }
        onApprove(buildApproveBody(form));
    };
    const reject = () => {
        if (!reason.trim()) { setLocalError(c.errReason); return; }
        onReject(reason.trim());
    };
    const equipmentName = (item) => (language === 'pt-BR' ? item.namePt || item.name : item.name || item.namePt);

    return (
        <form className="xr-form" onSubmit={submit} data-testid="exercise-request-admin-form">
            <h3>{c.formTitle}</h3>
            <p className="xr-muted">{c.formHint}</p>

            <div className="xr-grid">
                <label className="xr-field"><span>{c.name}</span><input value={form.name} onChange={(event) => set({ name: event.target.value })} maxLength={160} data-testid="xr-name" /></label>
                <label className="xr-field"><span>{c.namePt}</span><input value={form.namePt} onChange={(event) => set({ namePt: event.target.value })} maxLength={160} data-testid="xr-name-pt" /></label>
            </div>

            <div className="xr-field" role="group" aria-label={c.exerciseType}>
                <span>{c.exerciseType}</span>
                <div className="xr-chips">
                    {['weightBased', 'timeBased'].map((value) => (
                        <button key={value} type="button" aria-pressed={form.exerciseType === value} onClick={() => set({ exerciseType: value })}>{c[value]}</button>
                    ))}
                </div>
            </div>

            <label className="xr-field"><span>{c.description}</span><textarea rows={3} value={form.description} onChange={(event) => set({ description: event.target.value })} /></label>
            <label className="xr-field"><span>{c.video}</span><input type="url" value={form.videoUrl} onChange={(event) => set({ videoUrl: event.target.value })} placeholder="https://" /></label>

            <div className="xr-field" role="group" aria-label={c.musclesField}>
                <span>{c.musclesField}</span>
                {Object.entries(MUSCLE_GROUPS).map(([group, leaves]) => (
                    <div key={group} className="xr-muscle-row">
                        <small>{groupDisplayName(group, language)}</small>
                        <div className="xr-chips">
                            {leaves.map((leaf) => (
                                <button key={leaf} type="button" aria-pressed={form.leaves.includes(leaf)} onClick={() => toggle('leaves', leaf)}>{leafDisplayName(leaf, language)}</button>
                            ))}
                        </div>
                    </div>
                ))}
                {form.leaves.length > 0 && (
                    <ul className="xr-activation">
                        {form.leaves.map((leaf) => (
                            <li key={leaf}>
                                <span>{leafDisplayName(leaf, language)}</span>
                                <label>
                                    <span className="xr-sr">{c.activation}</span>
                                    <input type="number" min="1" max="100" inputMode="numeric" value={form.activation[leaf] ?? 100} onChange={(event) => set({ activation: { ...form.activation, [leaf]: event.target.value } })} data-testid={`xr-activation-${leaf}`} />
                                    <em>%</em>
                                </label>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="xr-field" role="group" aria-label={c.equipmentField}>
                <span>{c.equipmentField}</span>
                <div className="xr-chips">
                    {equipments.map((item) => (
                        <button key={item.id} type="button" aria-pressed={form.equipmentIds.includes(item.id)} onClick={() => toggle('equipmentIds', item.id)}>{equipmentName(item)}</button>
                    ))}
                </div>
            </div>

            <div className="xr-field">
                <span>{c.steps}</span>
                {form.steps.map((step, index) => (
                    <div key={index} className="xr-step">
                        <textarea rows={2} value={step} onChange={(event) => setStep(index, event.target.value)} maxLength={500} aria-label={`${c.steps} ${index + 1}`} />
                        {form.steps.length > 1 && <button type="button" className="xr-soft" onClick={() => set({ steps: form.steps.filter((_, i) => i !== index) })} aria-label={c.removeStep}>×</button>}
                    </div>
                ))}
                <button type="button" className="xr-soft" onClick={() => set({ steps: [...form.steps, ''] })}>{c.addStep}</button>
            </div>

            <label className="xr-field"><span>{c.adminNote}</span><textarea rows={2} value={form.adminNote} onChange={(event) => set({ adminNote: event.target.value })} /></label>

            {(localError || error) && <p className="xr-error" role="alert">{localError || error}</p>}

            <div className="xr-actions">
                <button type="submit" className="xr-solid" disabled={busy} data-testid="xr-approve">{busy ? c.saving : c.approve}</button>
            </div>

            <div className="xr-reject">
                <h4>{c.rejectTitle}</h4>
                <label className="xr-field"><span>{c.rejectReason}</span><textarea rows={2} value={reason} onChange={(event) => { setReason(event.target.value); setLocalError(''); }} maxLength={280} data-testid="xr-reject-reason" /></label>
                <button type="button" className="xr-soft is-danger" onClick={reject} disabled={busy} data-testid="xr-reject">{c.rejectCta}</button>
            </div>
        </form>
    );
}

export default function ExerciseRequests() {
    const { language } = useLanguage();
    const c = copy[language] || copy['pt-BR'];
    const { listExerciseRequests, approveExerciseRequest, rejectExerciseRequest, getEquipments } = useTrainingApi();
    const [filter, setFilter] = useState('Pending');
    const [rows, setRows] = useState(null);
    const [loadError, setLoadError] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [equipments, setEquipments] = useState([]);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        setRows(null);
        setLoadError(false);
        try {
            setRows(itemsOf(await listExerciseRequests({ status: filter === 'all' ? undefined : filter })));
        } catch {
            setLoadError(true);
        }
    }, [filter, listExerciseRequests]);

    useEffect(() => { load(); }, [load]);
    useEffect(() => {
        let active = true;
        Promise.resolve(getEquipments(undefined, 100)).then((page) => { if (active) setEquipments(itemsOf(page)); }).catch(() => {});
        return () => { active = false; };
    }, [getEquipments]);

    const selected = useMemo(() => (rows || []).find((row) => row.id === selectedId) || null, [rows, selectedId]);
    const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString(language, { day: '2-digit', month: 'short', year: 'numeric' }) : '');

    const finish = async (action) => {
        setBusy(true);
        setError('');
        try {
            await action();
            setSelectedId(null);
            await load();
        } catch (err) {
            setError(err?.message || c.errSave);
        } finally {
            setBusy(false);
        }
    };

    return (
        <section className="xr" data-testid="exercise-requests">
            <Link className="xr-back" to="/dashboard/admin">{c.back}</Link>
            <header className="xr-head">
                <span className="xr-kicker">{c.kicker}</span>
                <h1>{c.title}</h1>
            </header>

            <div className="xr-filters" role="group">
                {['Pending', 'Approved', 'Rejected', 'all'].map((value) => (
                    <button key={value} type="button" aria-pressed={filter === value} onClick={() => { setFilter(value); setSelectedId(null); }}>{c.filters[value]}</button>
                ))}
            </div>

            <div className="xr-layout">
                <div className="xr-list">
                    {loadError && <p className="xr-error" role="alert">{c.loadErr}</p>}
                    {!loadError && rows === null && <p className="xr-muted">{c.loading}</p>}
                    {rows && rows.length === 0 && <p className="xr-muted">{c.empty}</p>}
                    <ul>
                        {(rows || []).map((row) => (
                            <li key={row.id}>
                                <button type="button" aria-pressed={row.id === selectedId} onClick={() => { setSelectedId(row.id); setError(''); }} data-testid={`xr-row-${row.id}`}>
                                    <span className="xr-row-main">
                                        <strong>{row.name}</strong>
                                        <small>{row.requestedByName || `#${row.requestedByUserId}`}{row.createdAtUtc ? `, ${fmtDate(row.createdAtUtc)}` : ''}</small>
                                    </span>
                                    <span className="xr-badge" data-status={row.status}>{c.status[row.status] || row.status}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="xr-detail">
                    {!selected && <p className="xr-muted">{c.pick}</p>}
                    {selected && (
                        <>
                            <article className="xr-card" data-testid="xr-request">
                                <div className="xr-card-head">
                                    <h2>{selected.name}</h2>
                                    <span className="xr-badge" data-status={selected.status}>{c.status[selected.status] || selected.status}</span>
                                </div>
                                <dl>
                                    <div><dt>{c.requestedBy}</dt><dd>{selected.requestedByName || `#${selected.requestedByUserId}`}{selected.requestedByRole ? ` (${selected.requestedByRole})` : ''} {c.on} {fmtDate(selected.createdAtUtc)}</dd></div>
                                    <div><dt>{c.type}</dt><dd>{selected.kind ? exerciseKindLabel(selected.kind, language) : c.none}</dd></div>
                                    <div><dt>{c.muscles}</dt><dd>{(selected.muscleGroups || []).map((group) => groupDisplayName(group, language)).join(', ') || c.none}</dd></div>
                                    <div><dt>{c.equipment}</dt><dd>{[...(selected.equipmentNames || []), selected.equipmentOther].filter(Boolean).join(', ') || c.none}</dd></div>
                                    <div><dt>{c.notes}</dt><dd>{selected.notes || c.none}</dd></div>
                                    {selected.referenceUrl && <div><dt>{c.reference}</dt><dd><a href={selected.referenceUrl} target="_blank" rel="noopener noreferrer">{selected.referenceUrl}</a></dd></div>}
                                    {selected.status === 'Approved' && <div><dt>{c.linked}</dt><dd data-testid="xr-linked">{selected.exerciseName || `#${selected.approvedExerciseId}`}</dd></div>}
                                    {selected.status !== 'Pending' && <div><dt>{c.reviewedBy}</dt><dd>{selected.reviewedByName || `#${selected.reviewedByUserId}`}, {fmtDate(selected.reviewedAtUtc)}</dd></div>}
                                    {selected.status === 'Rejected' && <div><dt>{c.reason}</dt><dd>{selected.rejectionReason || c.none}</dd></div>}
                                </dl>
                            </article>

                            {selected.status === 'Pending' && (
                                <RequestForm
                                    key={selected.id}
                                    request={selected}
                                    equipments={equipments}
                                    c={c}
                                    language={language}
                                    busy={busy}
                                    error={error}
                                    onApprove={(body) => finish(() => approveExerciseRequest(selected.id, body))}
                                    onReject={(reason) => finish(() => rejectExerciseRequest(selected.id, { reason }))}
                                />
                            )}
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}
