import { useState, useEffect } from 'react';
import {
  CalendarIcon,
  PlusIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import type { EventWithSubject, Subject } from '../../shared/types';

export default function Calendar() {
  const [events, setEvents] = useState<EventWithSubject[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventWithSubject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [eventsData, subjectsData] = await Promise.all([
        window.electronAPI.getEvents(),
        window.electronAPI.getSubjects(),
      ]);
      setEvents(eventsData);
      setSubjects(subjectsData);
    } catch (error) {
      console.error('Error loading calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      try {
        await window.electronAPI.deleteEvent(id);
        loadData();
      } catch (error) {
        console.error('Error deleting event:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const openNewEventModal = () => {
    setEditingEvent(null);
    setShowEventModal(true);
  };

  const openEditEventModal = (event: EventWithSubject) => {
    setEditingEvent(event);
    setShowEventModal(true);
  };

  // Organiser les événements par date
  const upcomingEvents = events
    .filter((e) => new Date(e.event_date) >= new Date())
    .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());

  const pastEvents = events
    .filter((e) => new Date(e.event_date) < new Date())
    .sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500 dark:text-gray-400">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Calendrier</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Planifiez vos tests, khôlles et examens
          </p>
        </div>
        <button onClick={openNewEventModal} className="btn btn-primary">
          <PlusIcon className="w-5 h-5 mr-2" />
          Nouvel événement
        </button>
      </div>

      {/* Événements à venir */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          À venir ({upcomingEvents.length})
        </h2>
        {upcomingEvents.length === 0 ? (
          <div className="card text-center py-12">
            <CalendarIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              Aucun événement à venir. Créez-en un pour commencer !
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onEdit={() => openEditEventModal(event)}
                onDelete={() => handleDeleteEvent(event.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Événements passés */}
      {pastEvents.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Passés ({pastEvents.length})
          </h2>
          <div className="space-y-3 opacity-60">
            {pastEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onEdit={() => openEditEventModal(event)}
                onDelete={() => handleDeleteEvent(event.id)}
                isPast
              />
            ))}
          </div>
        </div>
      )}

      {showEventModal && (
        <EventModal
          event={editingEvent}
          subjects={subjects}
          onClose={() => setShowEventModal(false)}
          onSuccess={() => {
            setShowEventModal(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}

function EventCard({
  event,
  onEdit,
  onDelete,
  isPast = false,
}: {
  event: EventWithSubject;
  onEdit: () => void;
  onDelete: () => void;
  isPast?: boolean;
}) {
  const eventDate = new Date(event.event_date);
  const today = new Date();
  const daysUntil = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const eventTypeLabels = {
    test: 'Test',
    kholle: 'Khôlle',
    exam: 'Examen',
    other: 'Autre',
  };

  const eventTypeColors = {
    test: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
    kholle: 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400',
    exam: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400',
    other: 'bg-gray-100 dark:bg-gray-700/20 text-gray-700 dark:text-gray-400',
  };

  return (
    <div className="card group">
      <div className="flex items-start gap-4">
        <div
          className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
          style={{ backgroundColor: event.subject_color }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{event.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{event.subject_name}</p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-1 text-xs font-medium rounded ${
                  eventTypeColors[event.event_type]
                }`}
              >
                {eventTypeLabels[event.event_type]}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-600 dark:text-gray-300">
              {eventDate.toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            {!isPast && daysUntil >= 0 && (
              <span className="text-primary-600 dark:text-primary-400 font-medium">
                {daysUntil === 0
                  ? "Aujourd'hui"
                  : daysUntil === 1
                  ? 'Demain'
                  : `Dans ${daysUntil} jours`}
              </span>
            )}
          </div>
          {event.description && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{event.description}</p>
          )}
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            title="Modifier"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg"
            title="Supprimer"
          >
            <TrashIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
          </button>
        </div>
      </div>
    </div>
  );
}

function EventModal({
  event,
  subjects,
  onClose,
  onSuccess,
}: {
  event: EventWithSubject | null;
  subjects: Subject[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [subjectId, setSubjectId] = useState(event?.subject_id || subjects[0]?.id || 0);
  const [title, setTitle] = useState(event?.title || '');
  const [eventType, setEventType] = useState(event?.event_type || 'test');
  const [eventDate, setEventDate] = useState(
    event?.event_date || new Date().toISOString().split('T')[0]
  );
  const [description, setDescription] = useState(event?.description || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !eventDate) return;

    try {
      if (event) {
        await window.electronAPI.updateEvent(event.id, title, eventType, eventDate, description);
      } else {
        await window.electronAPI.createEvent(subjectId, title, eventType, eventDate, description);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving event:', error);
      alert("Erreur lors de l'enregistrement");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="card max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {event ? 'Modifier' : 'Nouvel'} événement
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Matière</label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(Number(e.target.value))}
              className="input"
              disabled={!!event}
            >
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Titre</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
              placeholder="Ex: Test chapitre 3"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Type</label>
            <select value={eventType} onChange={(e) => setEventType(e.target.value)} className="input">
              <option value="test">Test</option>
              <option value="kholle">Khôlle</option>
              <option value="exam">Examen</option>
              <option value="other">Autre</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Date</label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description (optionnel)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input"
              rows={3}
              placeholder="Chapitres concernés, précisions..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
              Annuler
            </button>
            <button type="submit" className="btn btn-primary flex-1">
              {event ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
