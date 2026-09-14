# Expectations in the Bible

A mobile-first discussion companion built from themes in two Ten Minute Bible Talks podcast episode transcripts. The guide centers on John 7:25–44 and John 12:12–19.

## Features

- Seven-section discussion flow with a horizontally scrolling navigation bar
- Every Scripture reference links to the passage on Bible.com (ESV)
- An unlisted leader guide (`leader.html`, not linked from the main page) with minute marks, readings, transitions, a short version, and a stopwatch that highlights the current step
- Interactive expectation audit
- Expectation and revelation comparison
- Guided reflection for unmet expectations
- Five-step surrender tool
- Ten group questions with optional follow-ups
- Full-screen Discussion Mode
- Automatic light and dark mode
- Keyboard support, visible focus states, reduced-motion support, and print styles

## Technology

The site uses plain HTML, CSS, and vanilla JavaScript. It requires no backend, database, authentication, API keys, package installation, or build step.

## Local preview

Open `index.html` (or `leader.html` for the leader guide) directly, or serve this folder with a simple static server:

```powershell
python -m http.server 8000
```

## GitHub Pages

Upload the files in this folder to the root of a GitHub repository. In the repository settings, enable Pages using the `main` branch and `/ (root)` as the source.

All site asset paths are relative, so the site works from either a GitHub user site or a repository subpath.

## Source note

The discussion guide paraphrases themes from automatically generated podcast transcripts. It does not reproduce the transcripts or a copyrighted Bible translation in full. Participants should read each listed passage in their preferred Bible translation and in its wider context.
