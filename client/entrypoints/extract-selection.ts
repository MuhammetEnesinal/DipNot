import { extractSource } from '@/lib/extraction/extract-source';

export default defineUnlistedScript(() => extractSource('selection', document, window));
