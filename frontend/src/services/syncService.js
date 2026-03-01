// Using simple fallback UUID instead of installing external package to keep dependencies low.

// Since Vite projects often don't have 'uuid' installed and we want to keep dependencies low,
// we'll use a simple fallback if uuid is not available or just generate a reasonably unique string.
export const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const QUEUE_KEY = 'jansetu_offline_queue';

/**
 * Enqueues a request into the local storage queue.
 * @param {string} endpoint The API endpoint (e.g., '/api/complaints')
 * @param {string} method HTTP method ('POST', 'PUT', etc.)
 * @param {object} payload The data payload to send
 * @param {object} meta Optional metadata (e.g., action type)
 * @returns {string} The local tracking ID
 */
export const enqueueRequest = (endpoint, method, payload, meta = {}) => {
    const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || ('[]'));

    const requestItem = {
        id: generateId(),
        timestamp: new Date().toISOString(),
        endpoint,
        method,
        payload,
        meta,
        status: 'pending',
        retryCount: 0
    };

    queue.push(requestItem);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));

    // Custom event so the UI can update the offline indicator/queue count
    window.dispatchEvent(new Event('offline-queue-updated'));

    return requestItem.id;
};

/**
 * Attempts to sync all pending requests in the queue with the backend.
 * @param {string} baseUrl The base API URL
 * @returns {Promise<number>} Number of successfully synced items
 */
export const syncRequests = async (baseUrl) => {
    if (!navigator.onLine) return 0;

    const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || ('[]'));
    const pendingRequests = queue.filter(req => req.status === 'pending');

    if (pendingRequests.length === 0) return 0;

    let syncedCount = 0;
    let hasFailures = false;

    for (let i = 0; i < queue.length; i++) {
        const req = queue[i];
        if (req.status !== 'pending') continue;

        try {
            const response = await fetch(`${baseUrl}${req.endpoint}`, {
                method: req.method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(req.payload)
            });

            if (response.ok) {
                req.status = 'synced';
                req.syncedAt = new Date().toISOString();
                syncedCount++;
            } else {
                req.retryCount = (req.retryCount || 0) + 1;
                hasFailures = true;
            }
        } catch (err) {
            req.retryCount = (req.retryCount || 0) + 1;
            hasFailures = true;
        }
    }

    // Remove fully synced items to keep storage clean, or keep a small history
    const newQueue = queue.filter(req => req.status === 'pending' || (new Date() - new Date(req.syncedAt)) < 24 * 60 * 60 * 1000);

    localStorage.setItem(QUEUE_KEY, JSON.stringify(newQueue));
    window.dispatchEvent(new Event('offline-queue-updated'));

    return syncedCount;
};

/**
 * Get the current queue count
 */
export const getQueueCount = () => {
    const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || ('[]'));
    return queue.filter(req => req.status === 'pending').length;
};
