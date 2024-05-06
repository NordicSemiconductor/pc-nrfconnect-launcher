export default function formatPublishTimestamp(publishTimestamp?: string) {
    if (!publishTimestamp) return '';

    return `, on ${new Date(publishTimestamp).toLocaleString()}`;
}
