const init = async function() {
};

/**
 * Create element from json template safely
 * Texts are handled with createTextNode(), therefore safe from injection.
 * @see {@link  https://developer.mozilla.org/en-US/docs/Archive/Add-ons/Overlay_Extensions/XUL_School/DOM_Building_and_HTML_Insertion#JSON_Templating|JSON Templating@developer.mozilla.org}
 * @param {array} json - Template
 * @param {string} json[0] - Element name
 * @param {object} json[1] - Attributes
 * @param {...string|array} json[2] - Children
 * @returns {object} - HTML element
 * @example
 * const content = $create(
 *     ['div', // Element name
 *         { // Attributes
 *             'class': 'foo'
 *         },
 *         // Children
 *         '<script>alert("not injected")</script>', // First child
 *         ['span', {}, // Second child. Can create child elements recursively
 *             'success!!',
 *         ],
 *     ]
 * );
 */
const $create = function $create(json) {
    const [tag, attrs, ...children] = json;

    // Create element
    const elem = document.createElement(tag);

    // Add properties
    for (const name in attrs) {
        if (attrs.hasOwnProperty(name)) {
            elem.setAttribute(name, attrs[name]);
        }
    }

    // Add child elements
    for (let i=0; i<children.length; i++) {
        if (typeof children[i] === 'object') {
            const node = $create(children[i]);
            elem.appendChild(node);
        } else {
            const node = document.createTextNode(children[i]);
            elem.appendChild(node);
        }
    }

    return elem;
};

const logError = function(error) {
    console.error(`Bookmarks and Histories from Same Domain: ${error}`);
};

try {
    init().catch(error => logError(error));
} catch (error) {
    logError(error);
}