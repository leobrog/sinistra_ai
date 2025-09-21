export function smartChunk(text: string, limit: number = 2000): Array<string> {
    if (text.length <= limit) {
        return [text];
    }

    const chunks = [];
    let currentChunk = '';

    const paragraphs = text?.split(/\n\s*\n/);

    for (let i = 0; i < paragraphs.length; i++) {
        const paragraph = paragraphs[i];
        if (paragraph && currentChunk.length + paragraph.length + 2 > limit) {
            chunks.push(currentChunk);
            currentChunk = '';
        }
        if (paragraph) {
            currentChunk += paragraph + '\n\n';
        }
    }
    chunks.push(currentChunk.trim());

    const finalChunks = [];
    for (const chunk of chunks) {
        if (chunk.length > limit) {
            const sentences = chunk.split(/(?<=[.?!])\s+/);
            let newChunk = '';
            for (const sentence of sentences) {
                if (newChunk.length + sentence.length > limit) {
                    finalChunks.push(newChunk);
                    newChunk = '';
                }
                newChunk += sentence;
            }
            finalChunks.push(newChunk);
        } else {
            finalChunks.push(chunk);
        }
    }

    return finalChunks;
}