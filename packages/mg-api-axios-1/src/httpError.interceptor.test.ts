import { describe, expect, it } from 'vitest';
import { createErrorHandlers, getErrorHandler } from './httpError.interceptor.js';

describe('createErrorHandlers', () => {
    it('returns default handlers when no custom handlers provided', () => {
        const handlers = createErrorHandlers();
        expect(handlers[401]).toBeDefined();
        expect(handlers[500]).toBeDefined();
        expect(handlers.default).toBeDefined();
    });

    it('merges custom handlers with defaults', () => {
        const custom = { 404: () => {} };
        const handlers = createErrorHandlers(custom);
        expect(handlers[401]).toBeDefined();
        expect(handlers[404]).toBe(custom[404]);
    });

    it('overrides default handlers when same status provided', () => {
        const custom = { 401: () => {} };
        const handlers = createErrorHandlers(custom);
        expect(handlers[401]).toBe(custom[401]);
    });
});

describe('getErrorHandler', () => {
    it('returns handler for specific status when available', () => {
        const handler404 = () => {};
        const result = getErrorHandler({ 404: handler404, default: () => {} }, 404);
        expect(result).toBe(handler404);
    });

    it('falls back to default handler when status not found', () => {
        const defaultHandler = () => {};
        const result = getErrorHandler({ default: defaultHandler }, 418);
        expect(result).toBe(defaultHandler);
    });

    it('returns default handler from DEFAULT_HANDLERS when no handler matches', () => {
        const result = getErrorHandler({}, undefined);
        expect(typeof result).toBe('function');
    });
});
