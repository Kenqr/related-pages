const init = async function() {
};

const logError = function(error) {
    console.error(`Bookmarks and Histories from Same Domain: ${error}`);
};

try {
    init().catch(error => logError(error));
} catch (error) {
    logError(error);
}
