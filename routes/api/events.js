const express = require('express');
const facebookUtils = require('../../utility/facebookUtils');
const Cache = require('../../utility/cache');

const router = express.Router();

const cache = new Cache(2 * 60 * 60, false);
const FB_EVENTS_KEY = 'facebook_events';

const TOTAL_EVENTS_COUNT = 3; // The number of events to return

/** 
 * Get events from Facebook (the number of events returned is TOTAL_EVENTS_COUNT).
 * First retrieve the upcoming events.
 * If there are less upcoming events, then recent past events are added.
 * 
 * To minimize the number of API calls, events are cached for 2 hours
 * 
 */
router.get('/facebook', async (req, res) => {
    // Check if the cache has events
    const events = cache.getKey(FB_EVENTS_KEY);
    if (events && Array.isArray(events) && events.length > 0) {
        // If events are found in cache, return these events
        return res.status(200).json({
            events: events
        });
    }

    try {
        let events = [];

        // Find upcoming events first
        const upcomingEvents = await facebookUtils.getUpcomingEvents();
        events = upcomingEvents.events.slice(0, TOTAL_EVENTS_COUNT);

        // If there are less upcoming events than needed, fetch most recent events
        if (events.length < TOTAL_EVENTS_COUNT) {
            const pastEvents = await facebookUtils.getPastEvents();
            const remaining_events_count = TOTAL_EVENTS_COUNT - events.length;

            events = events.concat(pastEvents.events.slice(0, remaining_events_count));
        }

        // Add facebook link for each event based on the event id
        events.forEach(event => {
            event.link = `https://www.facebook.com/events/${event.id}/`
        });

        // Save the retrieved events in cache
        cache.setKey(FB_EVENTS_KEY, events);

        return res.status(200).json({
            events: events
        });
    } catch (err) {
        return res.status(500).json({
            message: 'Failed to retrieve events from Facebook'
        });
    }
});

module.exports = router;