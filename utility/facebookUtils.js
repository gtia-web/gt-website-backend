const fetch = require('node-fetch');

const FB_GRAPH_QL_BASE = "https://graph.facebook.com/v10.0";

/**
 * Since this works on the backend without user intervention, we cannot have login flow.
 * It currently uses long-lived access token, which will be refereshed automatically as needed.
 * 
 * TODO:
 *  1. Build an admin tool, that allows the admin to retrieve user Access Token for our service account
 *  2. Store token and user information in the database instead of environment variable.
 * 
 * @returns Acesss token for the user
 */
function getAccessToken() {
    return process.env.FB_ACCESS_TOKEN;
}


/**
 * Facebook Page ID is permanent.
 * Hence we do need to make API calls to retrieve the page id for GTIA and instead store it
 * 
 * @returns Page Id for GTIA page
 */
function getPageId() {
    return process.env.FB_PAGE_ID;
}

/**
 * Retrieve the events from the Facebook Page from the given URL
 * Facebook GraphQL does pagination of the events and returns the next url to fetch additional events as required
 * 
 * @returns Events and next url to fetch additional events data
 */
async function getEvents(url) {
    try {
        const response = await fetch(url, { method: 'GET' });
        if (response.ok) {
            const events_data = await response.json();
            if (!events_data.data) {
                throw Error('No events data');
            }

            return {
                events: events_data.data,
                next: events_data.paging?.next
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
        const access_token = getAccessToken();
        const page_id = getPageId();
        const current_time = Math.round(Date.now() / 1000);

        const url = `${FB_GRAPH_QL_BASE}/${page_id}/events?since=${current_time}&access_token=${access_token}&sort=start_time_ascending`;

        return await getEvents(url);
    } catch (err) {
        throw Error('Failed to retrieve events from Facebook');
    }
}

/**
 * Retrieve the upcoming events from the Facebook Page
 * 
 * @returns Events and next url to fetch additional events
 */
async function getPastEvents() {
    try {
        const access_token = getAccessToken();
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