# Researcher workspace ribbon experiment

The researcher home keeps its six existing shortcuts and adds four experimental
circle-and-ribbon links: research, practices, evaluation tracking and training.
They use the existing `/workspace#…` routes and existing backend data. No API or
database change is required. Other roles keep their current workspace.

## Component

`src/components/RibbonButton/RibbonButton.jsx` owns the reusable link and artwork;
`RibbonButton.css` owns its styles. The component uses React and native SVG, with
no new runtime dependency or image assets.

```jsx
import RibbonButton from './components/RibbonButton/RibbonButton.jsx'

<RibbonButton
  to="/workspace#research"
  label="أبحاثي"
  caption="من الفكرة إلى النشر"
  symbol="01"
  icon="research"
  isArabic
  paused={false}
  offset={0}
/>
```

| Prop | Purpose |
| --- | --- |
| `to` | Existing application route. A real `href` preserves modified clicks and opening in another tab. |
| `relatedRoutes` | Optional routes that keep the same paper frame when navigating within the opened section. |
| `label` | Fixed text inside the circle. |
| `caption` | Text revealed on the ribbon; keep this short for phone widths. |
| `symbol` | Small index on the circle. |
| `icon` | `research`, `practices`, `tracking` or `training`. |
| `isArabic` | Mirrors travel direction and ribbon layout without mirroring letters. |
| `offset` | Initial loop offset in milliseconds, to gently stagger several buttons. |
| `paused` | Freezes the idle animation at its current position. Activation still completes. |
| `onOpen` | Optional custom callback after fully opening; receives the label, caption, route and source rectangle. Defaults to the shared page transition, or normal navigation outside its provider. |

## Motion and navigation

- `ribbonMotion.js` holds timings, easing and the connected SVG strip geometry.
  One progress value drives circle travel, rim rotation, remaining wrap and tail
  reveal. Text is outside the rotating rim. Rewinding uses the same geometry.
- An idle cycle lasts 10.4 seconds, including a 2.2 second fully open reading hold.
  Activation continues from the exact current progress, including while rewinding;
  a fully open ribbon proceeds immediately. One navigation is reserved at a time.
- `RibbonNavigationProvider` stays mounted in `AppLayout` across hash changes.
  It carries the open artwork from its measured source to the real destination
  header over 820ms. The circle keeps its size as the ribbon extends across the
  page. `RibbonPage` reveals the actual section content over the next 960ms.
- Destination content is inert until it is revealed, then its heading receives
  focus. Back/forward or another route cancels an in-flight transition.
- Off-screen buttons and background tabs stop advancing their idle clocks.
  Reduced motion displays open ribbons and skips decorative transition delays.
  The showcase also supplies a keyboard-accessible pause/resume control.

The showcase is isolated in `pages/Workspace/components/RibbonButtonShowcase.jsx`
and its stylesheet. It reuses the first four researcher section definitions rather
than introducing duplicate destinations. The paper frame appears only when
entering through these experimental links; existing navigation still works.
Research creation, drafts, decisions and tracking keep the research paper frame;
creating a practice keeps the practice frame. Navigating between these child
screens does not replay the flight animation.

## Verification

Run `npm test`, `npm run build`, and ESLint for the changed files. The motion tests
cover cycle continuity, activation from closed/open/rewinding positions, and
bounded geometry at mobile and desktop widths.

For visual acceptance in a researcher account:

1. Open `/workspace`; verify six original shortcuts plus four experimental links.
2. Watch a full open/close cycle; circle text must remain upright.
3. Activate during opening, while fully open, and during rewind. Verify no reset,
   only one transition, and the existing destination's working content.
4. Check research creation/drafts, practice links, tracking filters and training
   progress inside the unfolded page. Check browser back and rapid clicks.
5. Repeat with keyboard Enter, pause/resume, Arabic RTL, English LTR, narrow phone
   widths, and the system reduced-motion preference.

The repository-wide lint command currently reports pre-existing errors in
`features/workflow/LiveDataPanel.jsx` and duplicate `/map` keys in
`pages/Platform/platformPages.js` and `platformPages.en.js`; these are outside
this experiment.
