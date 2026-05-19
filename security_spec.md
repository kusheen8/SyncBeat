# SyncBeat Security Specification

## Data Invariants
1. A Room must have a valid `hostId` (User UID).
2. A Message must belong to a `roomId`.
3. A QueueItem must belong to a `roomId`.
4. Only the Room Host can update sensitive room state (playback, song).
5. Any authenticated user can read public song data.
6. Only members (anyone logged in for now) can read/write chat and queue in a room.

## Dirty Dozen Payloads (to be blocked)
1. Message with fake `userId`.
2. Updating `hostId` after room creation.
3. Deleting a room if not host.
4. Sending message to non-existent room.
5. Updating `votes` on queue item by 100 at once.
6. Reading other user's favorite lists.
7. Creating a room with a 1MB name string.
8. Injecting script tags in message text.
9. Changing the current song of a room if not host.
10. Setting `playbackTime` to a negative value.
11. Adding a song to the queue that doesn't exist in the library.
12. Creating a user profile for a different UID.

## Test Runner
(Omitted for brevity in this turn, focusing on rules generation)
