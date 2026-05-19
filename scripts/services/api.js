// api.js - Accesso endpoint REST Countries

// api.js - Accesso endpoint REST Countries per ricercare e recuperare dati nazioni

const API_BASE = "https://restcountries.com/v3.1";
const COUNTRY_FIELDS = [
    "name",
    "cca3",
    "capital",
    "region",
    "subregion",
    "population",
    "area",
    "flags",
].join(",");

/**
 * Calcola la densita abitativa (abitanti per km2) di una nazione.
 * 
 * @param {Object} country - Oggetto nazione con proprietà population e area
 * @returns {number} - La densita (abitanti/km2), o 0 se i dati non sono validi
 * 
 * @example
 * const density = getDensityValue({ population: 60000000, area: 301000 });
 * console.log(density); // ~199.33
 */
function getDensityValue(country) {
    if (!country || !Number.isFinite(country.area) || country.area <= 0) {
        return 0;
    }

    return country.population / country.area;
}

/**
 * Formatta la densita abitativa in una stringa leggibile (es: "199.33 ab/km2").
 * 
 * @param {number} density - Il valore di densita in abitanti per km2
 * @returns {string} - Stringa formattata con 2 decimali, o "N/D" se la densita non è valida
 * 
 * @example
 * console.log(formatDensityLabel(199.33)); // "199.33 ab/km2"
 * console.log(formatDensityLabel(0));     // "N/D"
 */
function formatDensityLabel(density) {
    return density > 0 ? `${density.toFixed(2)} ab/km2` : "N/D";
}

/**
 * Trasforma i dati grezzi ricevuti dall'API in un oggetto nazione semplificato.
 * Estrae campi importanti e calcola la densita abitativa.
 * 
 * @param {Object} rawCountry - Dati grezzi della nazione dall'API
 * @returns {Object} - Oggetto nazione semplificato con nome, codice ISO, capitale, regione, etc.
 * 
 * @example
 * const country = mapCountry(apiData);
 * console.log(country.name);     // "Italy"
 * console.log(country.code);     // "ITA"
 * console.log(country.density);  // 195.84
 */
function mapCountry(rawCountry) {
    const name = rawCountry?.name?.common || "Sconosciuto";
    const code = rawCountry?.cca3 || "N/D";
    const capital = Array.isArray(rawCountry?.capital) && rawCountry.capital.length > 0 ? rawCountry.capital[0] : "N/D";
    const region = rawCountry?.region || "N/D";
    const subregion = rawCountry?.subregion || "N/D";
    const population = Number(rawCountry?.population) || 0;
    const area = Number(rawCountry?.area) || 0;
    const density = getDensityValue({ population, area });

    return {
        name,
        code,
        capital,
        region,
        subregion,
        population,
        area,
        density,
        densityLabel: formatDensityLabel(density),
        flag: rawCountry?.flags?.svg || rawCountry?.flags?.png || "",
    };
}

/**
 * Effettua una richiesta HTTP all'API REST Countries e trasforma i risultati.
 * Gestisce errori e restituisce un array di nazioni mappate.
 * 
 * @param {string} url - L'URL completo dell'endpoint dell'API
 * @param {string} errorPrefix - Messaggio di errore da mostrare in caso di fallimento
 * @returns {Promise<Array>} - Promise che risolve con un array di nazioni semplificat, o array vuoto se errore 404
 * 
 * @example
 * const countries = await requestCountryList(
 *   "https://restcountries.com/v3.1/region/europe",
 *   "Errore nel caricamento europeo"
 * );
 */
async function requestCountryList(url, errorPrefix) {
    // TODO 1: Implementare la fetch all'url passato come parametro

    const risposta = await fetch(url);
     if (risposta.status === 404) {
    return [];
  }
    if (!risposta.ok) {
    throw new Error(errorPrefix + " - Codice: " + risposta.status);
  }
  const dati = await risposta.json();
  
    return dati.map(mapCountry);


    // Poi passare i dati ricevuti alla funzione mapCountry per trasformarli
    // e restituire un array di nazioni semplificate.
    // Se la risposta non è ok, lanciare un errore con il messaggio passato in errorPrefix e lo status code.
    // Se la fetch fallisce con un errore 404, restituire un array vuoto (non lanciare l'errore).
    
}

/**
 * Ordina un array di nazioni per una metrica specifica (popolazione, area, densita).
 * 
 * @param {Array} countries - Array di oggetti nazione
 * @param {string} [metric="population"] - La metrica per cui ordinare: "population", "area" o "density"
 * @param {string} [order="desc"] - Ordine: "asc" (crescente) o "desc" (decrescente)
 * @returns {Array} - Nuovo array ordinato (non modifica l'originale)
 * 
 * @example
 * const sorted = sortCountries(countries, "population", "desc");
 * // Paesi ordinati da piu a meno abitanti
 * 
 * const byArea = sortCountries(countries, "area", "asc");
 * // Paesi ordinati da piu piccolo a piu grande
 */
export function sortCountries(countries, metric = "population", order = "desc") {
    const sorted = countries.slice().sort((left, right) => {
        const leftValue = metric === "density" ? left.density : left[metric] || 0;
        const rightValue = metric === "density" ? right.density : right[metric] || 0;

        return leftValue - rightValue;
    });

    if (order === "desc") {
        sorted.reverse();
    }

    return sorted;
}

/**
 * Ricerca le nazioni per nome.
 * 
 * @param {string} name - Il nome (o parte di esso) della nazione da cercare
 * @returns {Promise<Array>} - Promise che risolve con un array di nazioni matching, o array vuoto se non trovato
 * 
 * @example
 * const results = await searchCountriesByName("Italy");
 * // Restituisce [{ name: "Italy", code: "ITA", ... }]
 */
export async function searchCountriesByName(name) {
    const query = String(name || "").trim();

    if (!query) {
        return [];
    }

    const url = `${API_BASE}/name/${encodeURIComponent(query)}?fields=${COUNTRY_FIELDS}`;
    return requestCountryList(url, "Errore nella ricerca per nome");
}

/**
 * Ricerca le nazioni per capitale.
 * 
 * @param {string} capital - Il nome (o parte di esso) della capitale da cercare
 * @returns {Promise<Array>} - Promise che risolve con un array di nazioni matching, o array vuoto se non trovato
 * 
 * @example
 * const results = await searchCountriesByCapital("Rome");
 * // Restituisce [{ name: "Italy", capital: "Rome", ... }]
 */
export async function searchCountriesByCapital(capital) {
    const query = String(capital || "").trim();
      //TODO DEBUGG (!)
    if (!query) {
        return [];
    }

    const url = `${API_BASE}/capital/${encodeURIComponent(query)}?fields=${COUNTRY_FIELDS}`;
    return requestCountryList(url, "Errore nella ricerca per capitale");
}

/**
 * Recupera tutte le nazioni di una specifica regione/continente.
 * 
 * @param {string} region - Il nome della regione (es: "Europe", "Asia", "Africa")
 * @returns {Promise<Array>} - Promise che risolve con un array di nazioni, o array vuoto se non trovato
 * 
 * @example
 * const europeanCountries = await getCountriesByRegion("Europe");
 * console.log(europeanCountries.length); // Es: 50+ nazioni
 */
export async function getCountriesByRegion(region) {
    const query = String(region || "").trim().toLowerCase();

    if (!query) {
        return [];
    }

    const url = `${API_BASE}/region/${encodeURIComponent(query)}?fields=${COUNTRY_FIELDS}`;
    return requestCountryList(url, "Errore nel filtro regione");
}

/**
 * Recupera tutte le nazioni del mondo.
 * Utilizza l'endpoint /all dell'API che non ha limiti.
 * 
 * @returns {Promise<Array>} - Promise che risolve con un array di tutte le nazioni
 * 
 * @example
 * const allCountries = await getAllCountries();
 * console.log(allCountries.length); // ~250 nazioni
 */
export async function getAllCountries() {
    const url = `${API_BASE}/all?fields=${COUNTRY_FIELDS}`;
    return requestCountryList(url, "Errore nel caricamento globale");
}

/**
 * Recupera un gruppo di nazioni specifiche tramite i loro codici ISO alpha-3.
 * Utile per caricare la lista dei preferiti salvati.
 * 
 * @param {Array<string>} codes - Array di codici ISO alpha-3 (es: ["ITA", "FRA", "DEU"])
 * @returns {Promise<Array>} - Promise che risolve con un array di nazioni matching
 * 
 * @example
 * const favorite = await getCountriesByCodes(["ITA", "FRA"]);
 * console.log(favorite[0].name); // "Italy"
 */
export async function getCountriesByCodes(codes) {
    if (!Array.isArray(codes) || codes.length === 0) {
        return [];
    }

    const cleanCodes = [...new Set(codes
        .map((code) => String(code || "").trim().toUpperCase())
        .filter((code) => /^[A-Z]{3}$/.test(code)))];

    if (cleanCodes.length === 0) {
        return [];
    }

    const url = `${API_BASE}/alpha?codes=${encodeURIComponent(cleanCodes.join(","))}&fields=${COUNTRY_FIELDS}`;
    return requestCountryList(url, "Errore nel recupero preferiti");
}
