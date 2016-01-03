# Connect 4

This is an online multiplayer Connect 4 game written as a technical experiment.

It's actually a "single-page app" but it doesn't use a single JS tag.  The way it does this is sort of convoluted.

### Usage

```bash
npm install
npm start
```

### Technical Details

The entire page is actually loading the whole time you play, and the server decides what the page content will be as the page loads.  This means only new tags can be added - nothing in the DOM can be removed or changed.  Content is retroactively changed anyway by overwriting past CSS with new `<style>` tags.  The server can tell when you click without switching to another page by using CSS `:active` selectors with `background` set to a fake image URL.  Normally, the browser would not make another request upon a second click, so it sends another style tag with a different `:active` URL each time a click happens.  The page finally finishes loading when someone wins or loses.

### Difficulty Settings
To play this on extra-hard mode, run `wget -qO- http://localhost:1337/`.
