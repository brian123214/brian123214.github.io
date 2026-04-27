# Narnia Chapter Panorama Site

A GitHub Pages-ready site for exploring **The Lion, the Witch and the Wardrobe** by chapter.

## Features

- Interactive Narnia-style map with chapter markers (17 chapters)
- Chapter list + marker sync (click either one)
- Panorama viewer per chapter with:
  - `Enter Chapter` button
  - Next / previous scene arrows
  - Drag-to-look-around 360 viewer (Pannellum)

## Project structure

- `index.html` - Page structure
- `styles.css` - Full visual styling and responsive layout
- `script.js` - Chapter map logic + panorama flow
- `panorama/chapter1/...png` - Current sample panorama image

## Add your own chapter panoramas

Right now each chapter uses the sample image as a placeholder.

1. Create chapter folders:
   - `panorama/chapter1/`
   - `panorama/chapter2/`
   - ...
   - `panorama/chapter17/`
2. Put your panorama image files in each folder.
3. Edit `script.js`:
   - Find `chapterData`
   - Replace each scene `image` path with your real files
   - Add/remove scene objects for each chapter as needed

Example scene object:

```js
{
  title: "Chapter 3: Snowy Lantern Wood",
  image: "panorama/chapter3/lantern-wood.jpg",
  pitch: 0,
  yaw: 120,
  hfov: 105,
}
```

## GitHub Pages publish

1. Push this repo to GitHub.
2. In GitHub repo settings, open **Pages**.
3. Source: `Deploy from a branch`.
4. Branch: `main` (or your default branch), folder: `/ (root)`.
5. Save.

Your site will be live at:

- `https://brian123214.github.io/`

