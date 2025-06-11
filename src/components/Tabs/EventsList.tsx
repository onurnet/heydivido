// src/components/Tabs/EventsList.tsx
import React from 'react';
import EventCard from './EventCard';
import type { Event } from '../../types/types';

interface EventsListProps {
  events: Event[];
}

const EventsList: React.FC<EventsListProps> = ({ events }) => {
  return (
    <div>
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
};

export default EventsList;
