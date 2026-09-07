import { useState, useEffect } from 'react';
import {
    getMutationQueue,
    subscribeMutationQueue,
    retryMutation,
    discardMutation,
    processQueue,
} from '../services/mutationQueue';

export const useMutationQueue = () => {
    const [queue, setQueue] = useState(() => getMutationQueue());

    useEffect(() => subscribeMutationQueue(setQueue), []);

    const pendingCount = queue.filter(m => m.status === 'pending' || m.status === 'syncing').length;
    const failedCount = queue.filter(m => m.status === 'failed').length;
    const conflictCount = queue.filter(m => m.status === 'conflict').length;

    return { queue, pendingCount, failedCount, conflictCount, retryMutation, discardMutation, processQueue };
};
