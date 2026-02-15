
self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : { title: 'תזכורת אירוע', body: 'יש לך אירוע קרוב!' };
  const options = {
    body: data.body,
    icon: '/icon.png',
    badge: '/badge.png',
    dir: 'rtl',
    lang: 'he',
    vibrate: [100, 50, 100],
    data: { url: data.url }
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(clients.openWindow('/'));
});
