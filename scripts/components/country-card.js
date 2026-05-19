// country-card.js - Componente card riusabile per visualizzare una nazione

import { sanitizeHTML } from "../core/errors.js";

/**
 * Formatta un numero per la visualizzazione nel formato locale italiano (es: 1.000.000).
 * 
 * @param {number} value - Il numero da formattare
 * @returns {string} - Stringa del numero formattato
 * 
 * @example
 * console.log(formatNumber(1234567)); // "1.234.567"
 */
function formatNumber(value) {
    return Number(value || 0).toLocaleString("it-IT");
}

/**
 * Crea un elemento HTML card per visualizzare i dettagli di un paese.
 * Include flag, nome, capitale, popolazione, area, densita e opzionale pulsante favorito.
 * 
 * @param {Object} options - Configurazione della card
 * @param {Object} options.country - Oggetto nazione con tutti i dati
 * @param {boolean} [options.showFavoriteButton=false] - Se mostrare il pulsante per aggiungere ai preferiti
 * @param {boolean} [options.isFavorite=false] - Se il paese è gia nei preferiti (per mostrare stella piena)
 * @param {Function} [options.onToggleFavorite] - Funzione callback quando si clicca il pulsante preferito
 * @returns {HTMLElement} - Elemento article con la card del paese
 * 
 * @example
 * const card = createCountryCard({
 *   country: { name: "Italy", code: "ITA", ... },
 *   showFavoriteButton: true,
 *   isFavorite: false,
 *   onToggleFavorite: (country, button) => console.log("Favorito!", country.name)
 * });
 * document.body.appendChild(card);
 */
export function createCountryCard({
    country,
    showFavoriteButton = false,
    isFavorite = false,
    onToggleFavorite,
}) {
    const card = document.createElement("article");
    card.className = "country-card";

    const flag = country.flag ? `<img class="country-flag" src="${country.flag}" alt="Bandiera ${sanitizeHTML(country.name)}">` : "";
    const favoriteButton = showFavoriteButton
        ? `<button type="button" class="btn btn-secondary btn-favorite" data-code="${sanitizeHTML(country.code)}">${isFavorite ? "★" : "☆"}</button>`
        : "";

    // TODO 1: Completare il template HTML della card usando i dati del paese. Sanificare sempre i dati dinamici con sanitizeHTML.
    // Manca la bandiera che va messa come prima cosa nella card
    // Poi manca il name che deve essere mostrato in un paragrafo prima del code (classe country-title)
    // Infine i dettagli come capital, region, population, area e densityLabel nella parte meta. (fai in 
    // modo di evidenziare il nome del campo, es: "Capitale: Roma")
    card.innerHTML = `

        <div class="country-header">
            <div>
            
             ${flag}
                   <p class="country-title">${sanitizeHTML(country.name)}</p>
                <p class="country-code">${sanitizeHTML(country.code)}</p>
            </div>
            ${favoriteButton}
        </div>

        <div class="country-meta">
             <p><strong>Capitale:</strong> ${sanitizeHTML(country.capital)}</p>
             <p>Regione:</strong> ${sanitizeHTML(country.region)}</p>
             <p>Popolazione:</strong> ${sanitizeHTML(country.population)}</p>
             <p>Area:</strong> ${sanitizeHTML(country.area)}</p>
             <p>Densità:</strong> ${sanitizeHTML(country.densityLabel)}</p>
        </div>
    `;

    if (showFavoriteButton && typeof onToggleFavorite === "function") {
        const button = card.querySelector(".btn-favorite");

        button.addEventListener("click", () => {
            onToggleFavorite(country, button);
        });
    }

    return card;
}

/**
 * Renderizza un array di card paesi dentro un contenitore.
 * Pulisce il contenitore e crea una card per ogni paese.
 * 
 * @param {Object} options - Configurazione del rendering
 * @param {HTMLElement} options.container - Elemento dove inserire le card
 * @param {Array} options.countries - Array di oggetti nazione da visualizzare
 * @param {boolean} [options.showFavoriteButton=false] - Se mostrare il pulsante favorito su ogni card
 * @param {Function} [options.isFavorite] - Funzione che ritorna true/false se il paese è favorito
 * @param {Function} [options.onToggleFavorite] - Callback quando si cambia uno stato favorito
 * 
 * @example
 * renderCountryCards({
 *   container: document.getElementById("results"),
 *   countries: countryArray,
 *   showFavoriteButton: true,
 *   isFavorite: (country) => favorites.includes(country.code),
 *   onToggleFavorite: (country, button) => { ... }
 * });
 */
export function renderCountryCards({
    container,
    countries,
    showFavoriteButton = false,
    isFavorite,
    onToggleFavorite,
}) {
    if (!container) {
        return;
    }

    container.innerHTML = "";

    countries.forEach((country) => {
        const card = createCountryCard({
            country,
            showFavoriteButton,
            isFavorite: typeof isFavorite === "function" ? isFavorite(country) : false,
            onToggleFavorite,
        });

        container.appendChild(card);
    });
}
