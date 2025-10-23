import { IncomingHttpHeaders } from 'node:http';
import { JSONPath } from 'jsonpath-plus';

export function getCorrelationFieldFromHeader(headers: IncomingHttpHeaders, correlationField: string): string | null {
    const value = headers[correlationField.toLowerCase()];

    if (!value) {
        return null;
    }

    return Array.isArray(value) ? JSON.stringify(value) : value;
}

export function getCorrelationFieldFromPayload(payload: any, correlationField: string): string | null {
    try {
        const matches = JSONPath({ path: correlationField, json: payload });
        if (matches.length === 0) {
            return null;
        }
        const match = matches[0];
        if (typeof match === 'string') {
            return match;
        } else {
            return JSON.stringify(match);
        }
    } catch (error) {
        console.error('Error extracting correlation field from payload:', error);
        return null;
    }
}
