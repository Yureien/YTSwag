# YTSwag: Better YouTube Music (BETA)

This is a yet-under-construction project to add new features to Youtube Music! Beta version for testing available!

Oh, and accepting logo submissions. (Read: Begging for a good logo, I suck at design)

Also, accepting new feature ideas (create an issue) as long as they can be feasibly implemented (offline mode, for one, cannot be feasibly implemented, atleast with a Chrome Extension).

## How Lyrics Work (as of now)

1. The extension first tries to get the official Closed Caption of the video if available, and present it as lyrics. Cause the Closed Captions has a timer, it's possible to know when the lyrics start and end, and highlighting is done.
2. As a backup, lyrics from Genius is taken in case CC is not available. This is done in a way similar to [SwagLyrics](https://github.com/SwagLyrics/SwagLyrics-For-Spotify).
3. (Not implemented) Thinking of using something like https://audd.io but it costs money to implement T_T

## TODO list/Planned Features

- [ ] ~~Eliminate jQuery from code~~
- [ ] List available languages except english for CC Lyrics
- [ ] Make option to select lyrics engines
- [ ] Fix all the existing bugs
- [ ] Add a Discord Rich Presence activity like Spotify
- [ ] Better media button controls, especially on Linux (?)
- [ ] Better theme/theme engine (Planned for future, no plans on implementing as of now)


## Credits

1. [SwagLyrics](https://github.com/SwagLyrics/SwagLyrics-For-Spotify) for letting me ~~steal~~ get code on how to get lyrics from Genius.
