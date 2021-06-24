//@ts-check
import * as wellKnown from "wellknown";// Well-known text (WKT) is a text markup language for representing vector geometry objects.
import * as turf from "@turf/turf";
import _ from "lodash";
//Sparql query api
// export const apiAddress = "https://api.labs.kadaster.nl/queries/jiarong-li/PandviewerTest/run"
// export const apiAddress = "https://api.labs.kadaster.nl/queries/BibiMaryam-SajjadianJaghargh/Geodatabgt/run"
export const apiAddress = "https://api.labs.kadaster.nl/queries/BibiMaryam-SajjadianJaghargh/Geodatabgttest/run"
export interface SparqlResults {
    head: Head;
    results: {
        bindings: Binding[];
    };
}
export interface Head {
    vars: string[];
}
export interface Binding {
    [varname: string]: BindingValue;
}
// modefication
export type BindingValue =
    | {
        type: "uri";
        value: string;
    }
    | {
        type: number; 
        value: string
    }
    | {
        type: "literal"; 
        value: string
    };


/**
 * Convert the sparql json results of user API into a Result.js array
 */
// new case
export async function searchResourcesDescriptions( res:SparqlResults) {

    //The sparql results may span multiple rows. So, group them and exclude the hostname and port of the current URL
        const groupedByIri = _.groupBy(res.results.bindings, b => b.sub.value); //s is the iri variable name
    return Promise.all(Object.entries(groupedByIri).map(async ([iri, bindings]: [iri: string, bindings: Array<Binding>]) => {
        if (!bindings) return undefined;
            let subHost = new URL(iri).host
            let geoJson: any = null
            let properties: any = {}
            for(let binding of bindings) {
                let propName = ''
                
                try {
                    
                    if(new URL(binding.pred.value).host === subHost) {
                        propName = binding.pred.value.split('/').slice(-1)[0]
                    }
                } catch (error) {}
                
                let value = binding.obj.value
                if(/^POLYGON\(\(.*\)\)$/i.test(value)) {
                    geoJson = wellKnown.parse(value)
                } else if(propName) {
                    properties[propName] = value
                }
            }
            
            let coords = turf.center(geoJson).geometry.coordinates
            let data
            try {
                data = await fetch(`${apiAddress}?lat=${coords[0]}&long=${coords[1]}`).then(result => result.json()).then(result => result[0])
                // delete data.address
                delete data.bagShape
                let browser = 'https://data.labs.kadaster.nl/kadaster/knowledge-graph/browser?resource='
                data.bag = `${browser}${data.bag}`
                data.bgt = `${browser}${data.bgt}`
                data.brt = `${browser}${data.brt}`
                data.nummeraanduiding = `${browser}${data.nummeraanduiding}`
            } catch (error) {}

            return {
                sub: iri,
                geo: geoJson,
                ...properties,
                ...(data || {})
            };
    }).filter(i => i));
}

/**
 * Get the coordinate query result from the api
 * @param lat 
 * @param long 
 */
export async function runQuery(lat: string, long: string): Promise<SparqlResults> {
    let sufUrl = '?lat=' + lat + '&long=' + long;
    let runApi = sufUrl; 
    const result = await fetch(runApi, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/sparql-results+json"
        },
    });
    if (result.status > 300) {
        throw new Error("Request with response " + result.status);
    }
    return JSON.parse(await result.text());
}

/**
 * Get the text search result from user's api
 * @param endpoint 
 * @returns 
 */
// new case
export async function searchQuery(endpoint:string): Promise<SparqlResults> {
    const result = await fetch(endpoint, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/sparql-results+json"
        },
    });
    if (result.status > 300) {
        throw new Error("Request with response " + result.status);
    }
    return result.json();
}

