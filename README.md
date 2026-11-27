# sabyasachi1406147.github.io

Personal academic website of Sabyasachi Biswas, Assistant Professor of Electrical and Computer Engineering at Grand Valley State University.

## How the site is built

The HTML pages in this folder are generated. Do not edit them by hand, or the next build will overwrite your change.

- `_source/src/data.js` holds all the content: bio, research, news, publications, students, teaching, CV.
- `_source/src/personal.html` holds the "Me and my family" text.
- `_source/static/assets/` holds the stylesheet, scripts and icons. `_source/static/cv.pdf` is the downloadable CV.
- `_source/src/build.js` turns those into the pages.

To rebuild after editing:

```
node _source/src/build.js
cp -r _source/dist/. .
```

## Publishing

GitHub Pages serves this repository from the `main` branch, root folder. On a free GitHub plan the repository must be public for the site to go live.
