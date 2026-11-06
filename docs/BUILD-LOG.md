# Quantum Leap build journal

## Exhibit 01 · The UAlbany classroom

Ashim started Quantum Leap as his sophomore-year final project at UAlbany. The site was about making the first year of college easier to navigate. The recovered source has Home, About, Services, Portfolio, and Contact pages, all using the same CSS. A small JavaScript contact-form demo validated and cleared its fields. The home page gave academic support and student life their own space.

The [home](../assets/screenshots/classroom-home.jpg) and [services](../assets/screenshots/classroom-services.jpg) captures come from the supplied HTML and CSS. The home capture includes the background referenced in its original stylesheet. Some image files referenced by the About and Portfolio pages were absent from the supplied folder. The classroom files stay in the original folder. This repository carries the captures and exhibit notes.

## Exhibit 02 · From college resource site to personal portfolio

The portfolio changed the audience and the purpose. Instead of collecting advice for incoming students, it presents Ashim's work and the evidence behind it. Releases through v1.0.8 added the public résumé, source-grounded Ambassador, and scrolling presentation. The CRT at the footer supplied a small command interface and an optional CarMechanicOS garage. The [v1.0.9 shell capture](../assets/screenshots/v130-crt-desktop.jpg) shows how little the initial filesystem needed to launch it.

## Exhibit 03 · A scroll-driven camera study

[v1.0.9](https://github.com/ashimcode/quantum-leap-resume/commit/9eb66c0) opened on an illustrated desk with a cursor-reactive ASCII portal that gives way to four camera acts. The media system uses HD scrub frames with matching 4K stills at rest. The camera labels and overlays describe a visual simulation. See the [portal capture](../assets/screenshots/v130-portal.jpg) and the [release verification](../RELEASE_VERIFICATION.md).

## Exhibit 04 · Give the CRT a place for its history

v1.0.10 gives the CRT a root directory modeled on the Filesystem Hierarchy Standard. It installs the fictional garage under /opt and places project exhibits under /usr/share/doc. Visitors can inspect the [filesystem root](../assets/screenshots/v140-crt-root.jpg) and [read the classroom and portfolio exhibits](../assets/screenshots/v140-crt-museum.jpg) in the terminal. The README gallery places the original pages beside these later builds, with captions so the screenshots can tell the story on their own.

The [terminal walkthrough](CRT-FILESYSTEM.md) explains what visitors can try. The [verification record](../RELEASE_VERIFICATION.md) documents the browser and release checks.

## Release chronology

The [version correlation tables](RELEASE-VERSION-MAP.md) connect the exhibit labels to the original Git history. The v1.0.14 milestone preserves the original ASCII orb and repairs Chrome tab-switch compositing.
