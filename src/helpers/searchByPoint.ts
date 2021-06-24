
import { searchResourcesDescriptions,runQuery,searchQuery} from "./sparql"; 
/**
 * 
 * @param lat 
 * @param lng 
 * @returns 
 */
export async function getFromCoordinates(lat : string, lng: string) {
  const results = await runQuery(lat,lng);
  console.log(await results);
 
}

/**
 * @param Endpoint
 * @returns 
 */

// This function get data  from interface and returns the results
export async function getFromTextSearch(endpoint:string) {
// get the JSON from API
  const results = await searchQuery(endpoint);
 return searchResourcesDescriptions(results);
}
