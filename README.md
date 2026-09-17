# Quad Quest

**Four sides. Endless possibilities.** A standalone, mobile-first Class 8 maths adventure for **Ganita Prakash, Grade 8, Part I, Chapter 4: Quadrilaterals**.

Five studios, **30 activities**, 15 stars and three unscored geometry playgrounds. Built with the lightweight, framework-free approach of Rational Realms and the learning controls of Power Quest, with original geometry interactions, diagrams and a new visual identity. Its repository, Android package and saved progress are separate from the earlier apps.

## Play or install

- [Play in your browser](https://manojraga.github.io/quad-quest/)
- [Download the Android APK](https://github.com/ManojRaga/quad-quest/raw/refs/heads/main/dist/Quad-Quest.apk)
- [Download the portable web bundle](https://github.com/ManojRaga/quad-quest/raw/refs/heads/main/dist/Quad-Quest-Web.zip)

The Android app is **Quad Quest**, package `com.manoj.quadquest`. Minimum version: Android 7.0 (API 24). It works offline from installation and coexists with the other chapter apps. Open the APK on your phone to install; Android may ask you to allow installation from that source.

This APK uses the machine’s **Android debug signing key**, suitable for classroom testing and direct installation, not a Play Store release. Use a separately backed-up release key for long-term distribution. No signing keys are included. Physical-device installation has not been tested.

The browser app works offline after its first complete load over HTTPS or localhost. Supporting browsers offer **Add to Home Screen**. No accounts, analytics, advertising, external fonts or runtime network services. Progress and sound preferences stay on this device; clearing app/browser data may remove them.

## The discovery trail

| Studio | Learning through play | Chapter 4 printed pages |
| --- | --- | --- |
| The Frame Studio | Complete a rectangle on a geoboard, compare diagonals, construct a square, explore overlapping families | 83–94 |
| The Parallel Pavilion | Find missing angles, build a parallelogram, use diagonal bisection, distinguish properties | 94–99 |
| The Diamond Gallery | Construct a rhombus, bisect angles, join equilateral triangles, arrange a geometric proof | 99–105 |
| The Sky Courtyard | Classify kites, distinguish diagonal properties, reason about trapeziums and inclusive definitions | 105–110 |
| The Architect’s Loft | Connect families, build a rotated square, order construction steps, test a diagonal counterexample | 83–110, synthesis |

All activity text and artwork are original. The supplied textbook PDF is not distributed. This is a focused teaching companion, not a reproduction of every exercise. Physical cutting, folding and compass-and-ruler practice remain useful classroom extensions.

### Geometry conventions

- Definitions follow the supplied chapter: a **trapezium has at least one pair of opposite sides parallel**, so parallelograms also qualify.
- A **kite has two non-overlapping pairs of equal adjacent sides**. Rhombuses and squares therefore qualify. A concave kite is included in the family explorer.
- A square belongs to both the rectangle and rhombus families. Family selection requires every applicable name.
- Quadrilaterals have four distinct vertices, no crossed sides and no straight-through corners. Concave shapes are allowed; their interior angles include a reflex angle and sum to 360°.
- Equal diagonals alone do **not** imply a rectangle. In the diagonal rig both diagonals always bisect each other; with that condition, equal lengths give a rectangle and perpendicular diagonals give a rhombus.
- Computed diagrams use actual coordinates. Angle exercises whose drawings are schematic explicitly say **not to scale**. For concave shapes, perpendicularity refers to the lines containing the diagonals; a dotted extension shows where they meet. Displayed measurements are rounded; classification uses the underlying coordinates.

## Learning controls

- Six discoveries per studio, with a clue and an explanation for every activity. No timers or lives.
- Retry freely. Two incorrect submissions unlock **Show me how**. A clue, solution or incorrect submission marks the activity as assisted.
- Six unaided answers earn three stars, four or five earn two, and completing the studio earns at least one. Replaying keeps the best score.
- Correct answers save immediately. Unanswered activities restart on return, preserving whether help was used; partially arranged controls are not saved.
- **Settings → Classroom mode** opens all studios for the current page session. Resetting progress requires confirmation.
- Keyboard controls, visible focus, descriptive labels, coordinate selectors and reduced-motion preferences are supported. Sound is optional.
- **Free geoboard:** move any vertex and inspect family membership, angles and diagonal lengths.
- **Diagonal rig:** vary a diagonal’s length and crossing angle while both midpoints remain fixed.
- **Shape families:** inspect nine examples, including a concave kite and an equal-diagonal counterexample, with a full membership table.

## Develop locally

```sh
git clone https://github.com/ManojRaga/quad-quest.git
cd quad-quest
npm start
```

Open **http://localhost:8160/**. The web app has no compilation step or runtime package dependencies. `npm ci` installs the Capacitor Android tools. The server also accepts local-network connections; browser offline caching requires HTTPS or localhost, not ordinary LAN HTTP.

## Build Android

```sh
npm ci
npx cap sync android
cd android
./gradlew -Dorg.gradle.java.home='/Applications/Android Studio.app/Contents/jbr/Contents/Home' assembleDebug
```

Set the ignored `android/local.properties` to your SDK location (`sdk.dir=/absolute/path/to/sdk`). Adapt the JDK path for other machines. Output: `android/app/build/outputs/apk/debug/app-debug.apk`; published copy: `dist/Quad-Quest.apk`.

Launcher and splash artwork come from `www/icons/icon.svg`. Regenerate with `node scripts/android-art.mjs` with `sharp` installed, or pass the absolute path to its module as the first argument.

## Publish updates

`main` holds the full project; `gh-pages` holds only the `www/` subtree. GitHub Pages publishes the root of `gh-pages`. All asset URLs, manifest paths and service-worker scope work under `/quad-quest/`.

Before changing web content, **increment the cache version in `www/sw.js`**. Rebuild and replace the APK and web ZIP so downloads match the website. Commit changes on `main`, then run:

```sh
npm run deploy
```

The script requires a clean working tree and an authenticated GitHub CLI (`gh`). It runs the unit tests, builds the subtree branch, pushes both branches atomically without force-pushing, and explicitly queues a Pages build.

## Verification

```sh
npm test
node scripts/browser-qa.mjs --full
node scripts/browser-qa.mjs --full --width=320
node scripts/browser-qa.mjs --deployed --url=https://manojraga.github.io/quad-quest/
```

Browser checks require Playwright and Chromium, plus a running local server unless using the published URL. Existing installations can be supplied with `--playwright=/absolute/path/to/playwright/index.mjs` and `--chromium=/absolute/path/to/browser`.

Eight unit-test groups cover inclusive family definitions, invalid shapes, rotation/reflection/scale invariance, all 576 diagonal configurations, angle relations and counterexamples, all 30 activity schemas and reachable answers, independent numeric checks, scoring and storage.

The browser walkthrough uses actual controls for every activity and checks hints, retries, resume, saving immediately after an answer, unlocks, all 15 stars, replay improvement, three labs, field notes, offline reload, phone/tablet layouts, classroom mode, reset confirmation/cancellation and sound persistence. Screenshots are stored in ignored `test-results/`. The APK is compiled and signature-verified; physical-phone testing remains a follow-up.

## Source layout

```text
www/js/content.js       five studios and 30 activities
www/js/math.js          geometry and shape classification
www/js/visuals.js       original SVG diagrams
www/js/puzzles.js       six types of interactive activity
www/js/labs.js          three geometry playgrounds
www/js/app.js           adventure, runner, notes and settings
www/js/state.js         isolated device-local progress
www/css/geometry.css   chapter-specific visual design
www/sw.js              complete, versioned offline cache
scripts/               local server, artwork, QA and deployment
tests/                 dependency-free maths and state tests
android/               distinct Capacitor Android project
dist/                  APK and portable web bundle
```
