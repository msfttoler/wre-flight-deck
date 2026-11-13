# Flight Deck design system

Use the Clawpilot theme's exact light and dark `--cp-*` token sets. Components
use only semantic variables for color. Restrained rose accent marks selection,
focus and the primary action, not every surface.

Native "Segoe UI", Aptos, Calibri, -apple-system, BlinkMacSystemFont, sans-serif
typography; Consolas/Courier for flight identifiers and times. Fixed rem scale,
clear weight contrast, 70ch maximum prose measure. Airport codes and route
relationships create the aviation character without novelty fonts.

Use flat departure rows, a meaningful route map, a clear next-step fare panel,
quiet dividers and generous whitespace. Do not use a hero-metric dashboard,
identical card grids, colored side stripes or nested cards. Round controls
10px and panels 16px. All controls need default, hover, focus, busy and error
behavior. Small screens stack the route and fare panels.

All forms have labels. All status changes have text, not color alone. Route
information has text equivalents. Announce results and failures, preserve user
input after errors, respect reduced motion, and support keyboard-only use.
Automated scans do not establish complete WCAG conformance.
