import { useEffect, useState } from 'react';
import { listNotices } from '../services/platformClient';

export const NOTICES_CHANGED = 'shapeup_notices_changed';

/** Unread platform notices, for the bell next to the profile. Refreshes when the inbox marks one read. */
export default function useUnreadNotices() {
    const [unread, setUnread] = useState(0);

    useEffect(() => {
        let active = true;
        const load = () => {
            Promise.resolve(listNotices({ pageSize: 30 }))
                .then((page) => { if (active) setUnread((page?.items ?? []).filter((notice) => !notice.readAtUtc).length); })
                .catch(() => { if (active) setUnread(0); });
        };
        load();
        window.addEventListener(NOTICES_CHANGED, load);
        return () => {
            active = false;
            window.removeEventListener(NOTICES_CHANGED, load);
        };
    }, []);

    return unread;
}
