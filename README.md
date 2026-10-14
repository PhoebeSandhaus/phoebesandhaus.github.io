# phoebesandhaus.github.io

My personal academic website. It's plain HTML/CSS/JS, so there's no build step. GitHub Pages serves it as is.

## Editing content

Everything you'll want to change is in **`index.html`**. Search for `EDIT` to find each spot.

| What | Where |
| --- | --- |
| Headshot | Put your photo in `assets/` (e.g. `assets/headshot.jpg`) and update the `<img src>` in the hero section. A square crop works best. |
| CV | Save it as `assets/cv.pdf`. |
| Publications | Copy/paste an `<li class="pub">` block. Set `data-type` to `journal`, `review`, or `prep`, and wrap your name in `<span class="me">`. |
| Research themes, courses, service | Copy/paste an `<article>` block in that section. |
| Colors | Change the variables at the top of `styles.css` (`--accent`, `--warm`, etc.). |

## Preview locally

Open `index.html` in a browser, or run:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Publish on GitHub Pages

1. Create a **public** repo on GitHub named exactly `phoebesandhaus.github.io`.
2. Push this folder:
   ```sh
   git add .
   git commit -m "Initial website"
   git branch -M main
   git remote add origin https://github.com/phoebesandhaus/phoebesandhaus.github.io.git
   git push -u origin main
   ```
3. On GitHub, go to **Settings → Pages**. Set *Source* to **Deploy from a branch**, then choose branch `main` and folder `/ (root)`.
4. After a minute or two the site is live at **https://phoebesandhaus.github.io**.
5. To publish future changes to the website, run:
   ```sh
   git add -A && git commit -m "Update site" && git push
   ```