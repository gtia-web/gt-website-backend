const fetch = require('node-fetch');

const FB_GRAPH_QL_BASE = "https://graph.facebook.com/v10.0";

/**
 * Since this works on the backend without user intervention, we cannot have a login flow.
 * We are using long-lived Page Access Token, which does not have any expiration date.
 * 
 * However, if the app permission is revoked from the page or there are some changes to Facebook's policy, the token might become invalid.
 * If new token is needed:
 *  1. Retrieve the user access token from Graph API explorer since we do not have a separate login flow - https://developers.facebook.com/tools/explorer/
 *  2. Retrieve long-lived user access token - https://developers.facebook.com/docs/pages/access-tokens/#get-a-long-lived-user-access-token
 *  3. Retrieve page access token from this new user token - https://developers.facebook.com/docs/pages/access-tokens/#get-a-page-access-token
 * 
 * TODO:
 *  1. Store token and user information in the database instead of environment variable.
 *      This allows us to change them in runtime if needed without having the re-deploy the application.
 * 
 *  2. Create an admin tool to get new page access token if needed in case the previousu token was invalidated
 * 
 * @returns Acesss token for the page
 */
function getPageAccessToken() {
    return process.env.FB_PAGE_ACCESS_TOKEN;
}


/**
 * Facebook Page ID is permanent.
 * Hence we do need to make API calls to retrieve the page id for GTIA and can instead store it directly
 * 
 * @returns Page Id for GTIA page
 */
function getPageId() {
    return process.env.FB_PAGE_ID;
}

/**
 * Check if the specified url is valid API endpoint to retrieve events from Facebook GraphQL
 * Throws exception if it does not match
 * 
 * @param {} url url to be checked
 * @returns null
 */
async function validateEventsUrl(url) {
    // Check for valid url
    const regex = new RegExp(`^${FB_GRAPH_QL_BASE}/[0-9]+/events`);
    if (regex.test(url)) {
        return;
    }

    throw Error(`Invalid API endpoint specified. It must be in the form ${FB_GRAPH_QL_BASE}/:pageId/events`)
}

/**
 * Retrieve the events from the Facebook Page from the given URL
 * Facebook GraphQL does pagination of the events and returns the next url to fetch additional events as required
 * 
 * @returns Events and next url to fetch additional events data
 */
async function getEvents(url) {
    try {
        validateEventsUrl(url);

        const response = await fetch(url, { method: 'GET' });
        if (response.ok) {
            const events_data = await response.json();
            if (!events_data.data) {
                throw Error('No events data');
            }

            // Plesk is running Node version < 14. Hence optional chaining is not supported :(
            return {
                events: events_data.data,
                next: events_data && events_data.paging && events_data.paging.next
            };
        }

        throw Error('Failed request to retrieve data');
    } catch (err) {
        console.error(err);
        throw err;
    }
}

/**
 * Retrieve the upcoming events from the Facebook Page in ascending order of start time
 * 
 * @returns Events and next url to fetch additional events
 */
async function getUpcomingEvents() {
    try {
        const access_token = getPageAccessToken();
        const page_id = getPageId();
        const current_time = Math.round(Date.now() / 1000);

        const url = `${FB_GRAPH_QL_BASE}/${page_id}/events?since=${current_time}&access_token=${access_token}&sort=start_time_ascending`;

        return await getEvents(url);
    } catch (err) {
        throw Error('Failed to retrieve events from Facebook');
    }
}

/**
 * Retrieve the past events from the Facebook Page.
 * They are ordered from most recent to the oldest event
 * 
 * @returns Events and next url to fetch additional events
 */
async function getPastEvents() {
    try {
        const access_token = getPageAccessToken();
        const page_id = getPageId();
        const current_time = Math.round(Date.now() / 1000);

        const url = `${FB_GRAPH_QL_BASE}/${page_id}/events?until=${current_time}&access_token=${access_token}`;

        return await getEvents(url);
    } catch (err) {
        throw Error('Failed to retrieve events from Facebook');
    }
}

module.exports = {
    getUpcomingEvents,
    getPastEvents
};