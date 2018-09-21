const init = async function() {
    // Get hostname of current tab
    const tabs = await browser.tabs.query({currentWindow: true, active: true});
    const url = new URL(tabs[0].url);
    const hostname = url.hostname;

    // Get bookmarks in the same domain
    const allBookmarks = await getBookmarks();
    const bookmarksInSameDomain = allBookmarks.filter(bookmark => {
        const bUrl = new URL(bookmark.url);
        return bUrl.hostname === hostname && bookmark.url !== tabs[0].url;
    });

    // Build list
    const list = ['li', {}];
    for (const bookmark of bookmarksInSameDomain) {
        list.push([
            'li', {},
            [
                'a',
                {
                    href: bookmark.url,
                    onclick: onListItemClick, // Open link in current window
                },
                bookmark.title
            ]
        ]);
    }

    // Show list on popup
    $('#main').appendChild($create(list));
};

/** Open link in current window */
const onListItemClick = function(event){
    const href = event.target.getAttribute('href');
    browser.tabs.create({
        url: href,
    });
    event.preventDefault();
};

const getBookmarks = async function(bookmarkRoot) {
    let bookmarks = [];

    bookmarkRoot = bookmarkRoot || (await browser.bookmarks.getTree())[0];

    if (bookmarkRoot.url && bookmarkRoot.type !== 'separator') {
        bookmarks.push(bookmarkRoot);
    }

    if (bookmarkRoot.children) {
        for (const child of bookmarkRoot.children) {
            bookmarks = bookmarks.concat(await getBookmarks(child));
        }
    }

    return bookmarks;
};

/**
 * Alias for querySelector
 * @param {string} selector 
 * @param {Element} [baseElement=document]
 * @returns {Element|null}
 */
const $ = function(selector, baseElement = document){
    return baseElement.querySelector(selector);
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
            if (typeof attrs[name] == 'function') {
                elem.addEventListener(name.replace(/^on/, ''), attrs[name]);
            } else {
                elem.setAttribute(name, attrs[name]);
            }
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
