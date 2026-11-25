# Jacob Nicholson — Portfolio

Hand-designed and custom-coded portfolio of Jacob Nicholson, healthcare product designer.

**Live site:** [jacobnicholson.work](https://jacobnicholson.work)

## About

I designed this site and built it from scratch, with no templates or site builders. It's plain HTML, CSS and JavaScript, so every interaction is something I designed and then implemented myself.

### Case studies

| Page | Project |
|---|---|
| `case-study-one.html` | Discovering a New Way to Coach |
| `case-study-two.html` | Adding Clear Signals for the Whole Care Team |
| `case-study-three.html` | Ideas and the Spaces that Represent Them |
| `case-study-four.html` | Streamlining Design Challenges |

Case studies one and two have a light password gate. It's a courtesy lock for client work, not real security.

## Features

- **Scroll-snapping layout.** Each project and chapter locks into view, on desktop and mobile.
- **Dock navigation.** On case-study pages, a dot for each chapter highlights as you read and jumps to that section when clicked.
- **Interactive soundscape.** Case study three has a Past / Present / Future card that pairs audio with an animated sky.
- **Responsive by design.** The phone layouts are composed separately, not just shrunk-down desktop pages.
- **Reduced-motion support.** Animations respect the `prefers-reduced-motion` setting.
- **Custom cursor and hover states** that match the visual language.

## Built with

- **Front end:** HTML5, CSS3, vanilla JavaScript
- **Design:** Figma, Adobe Creative Suite
- **Hosting:** Firebase Hosting
- **Tools:** VS Code, Git/GitHub
- **AI-assisted development:** Claude Code, for refactoring, code review and organizing the project
- **Code quality:** SonarQube for IDE and Stylelint

## Project structure

```
├── index.html, about.html, case-study-*.html
├── css/style.css
├── js/            dock, password gate, mobile layout, soundscape
├── images/        home/, about/, case-study-one … four/
└── audio/         soundscape tracks
```

## Run locally

```bash
firebase serve
```

Then open http://localhost:5000. You can also just open `index.html` in a browser.

## Contact

[jacobnicholson.work](https://jacobnicholson.work) · [LinkedIn](https://linkedin.com/in/jacob-nicholson-design)
