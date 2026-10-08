import { extractSource } from '@/lib/extraction/extract-source';

export default defineUnlistedScript(() => extractSource('page', document, window));
