const express = require('express');
const facebookUtils = require('../../utility/facebookUtils');

const router = express.Router();

const TOTAL_EVENTS_COUNT = 3; // The number of events to return

/** 
 * Get events from Facebook (the number of events returned is TOTAL_EVENTS_COUNT).
 * First retrieve the upcoming events.
 * If there are less upcoming events, then recent past events are added.
 * 
 */
router.get('/events/facebook', async (req, res) => {
    try {
        let events = []

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