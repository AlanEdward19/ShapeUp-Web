/** Official public lookup pages for Brazilian professional councils. */
const CREF_BY_REGION = {
    AC: 'https://www.crefac.org.br/',
    AL: 'https://www.crefal.org.br/',
    AM: 'https://www.crefam.org.br/',
    AP: 'https://www.crefap.org.br/',
    BA: 'https://www.crefba.org.br/',
    CE: 'https://www.crefce.org.br/',
    DF: 'https://www.crefdf.org.br/',
    ES: 'https://www.crefes.org.br/',
    GO: 'https://www.crefgo.org.br/',
    MA: 'https://www.crefma.org.br/',
    MG: 'https://www.crefmg.org.br/',
    MS: 'https://www.crefms.org.br/',
    MT: 'https://www.crefmt.org.br/',
    PA: 'https://www.crefpa.org.br/',
    PB: 'https://www.crefpb.org.br/',
    PE: 'https://www.crefpe.org.br/',
    PI: 'https://www.crefpi.org.br/',
    PR: 'https://www.crefpr.org.br/',
    RJ: 'https://www.crefrj.org.br/',
    RN: 'https://www.crefrn.org.br/',
    RO: 'https://www.crefro.org.br/',
    RR: 'https://www.crefrr.org.br/',
    RS: 'https://www.crefrs.org.br/',
    SC: 'https://www.crefsc.org.br/',
    SE: 'https://www.crefse.org.br/',
    SP: 'https://www.crefsp.gov.br/',
    TO: 'https://www.crefto.org.br/',
};

const CONFEF = 'https://www.confef.org.br/confef/';
const CRN = 'https://consultanacional.cfn.org.br/';

export function councilLookupUrl(authority, region) {
    const council = String(authority || '').toUpperCase();
    const uf = String(region || '').toUpperCase();
    if (council === 'CRN') return CRN;
    if (council === 'CREF') return CREF_BY_REGION[uf] || CONFEF;
    return null;
}
