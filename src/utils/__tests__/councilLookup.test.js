import { describe, expect, it } from 'vitest';
import { councilLookupUrl } from '../councilLookup';

describe('councilLookupUrl', () => {
    it('opens the regional CREF site and the national CRN lookup', () => {
        expect(councilLookupUrl('CREF', 'SP')).toBe('https://www.crefsp.gov.br/');
        expect(councilLookupUrl('cref', 'rj')).toBe('https://www.crefrj.org.br/');
        expect(councilLookupUrl('CREF', 'ZZ')).toBe('https://www.confef.org.br/confef/');
        expect(councilLookupUrl('CRN', 'SP')).toBe('https://consultanacional.cfn.org.br/');
        expect(councilLookupUrl('OTHER', 'SP')).toBeNull();
    });
});
