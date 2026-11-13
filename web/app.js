const $ = (selector) => document.querySelector(selector);
const state = {
  network: null, itineraries: [], selected: null, quote: null,
  search: null, bookings: [], flight: null, attempt: null, searchSequence: 0,
};
const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const money = (cents) => Number.isSafeInteger(cents) ? usd.format(cents / 100) : "Unavailable";
const time = (iso) => new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "UTC" });
const date = (iso) => new Date(iso.length === 10 ? `${iso}T12:00:00Z` : iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
const duration = (minutes) => `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
const ns = "http://www.w3.org/2000/svg";

function node(tag, attrs = {}, ...children) {
  const element = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === "className") element.className = value;
    else if (key.startsWith("on") && typeof value === "function") element.addEventListener(key.slice(2).toLowerCase(), value);
    else if (value !== false && value != null) element.setAttribute(key, value === true ? "" : value);
  }
  for (const child of children.flat(Infinity)) {
    if (child != null) element.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return element;
}
function svgNode(tag, attrs = {}, content) {
  const element = document.createElementNS(ns, tag);
  for (const [key, value] of Object.entries(attrs)) element.setAttribute(key, value);
  if (content != null) element.textContent = content;
  return element;
}
function feedback(target, message = "", kind = "info") {
  const element = typeof target === "string" ? $(target) : target;
  element.textContent = message;
  element.dataset.kind = kind;
  element.hidden = !message;
}
function revealAndFocus(target) {
  const element = typeof target === "string" ? $(target) : target;
  if (!element) return;
  element.scrollIntoView({ block: "center", inline: "nearest", behavior: "auto" });
  element.focus();
}
function errorText(error) {
  return `${error.message}${error.requestId ? ` Request ID: ${error.requestId}.` : ""}`;
}
async function api(path, options = {}) {
  let response;
  try {
    response = await fetch(path, { ...options, headers: { ...(options.body ? { "Content-Type": "application/json" } : {}), ...options.headers } });
  } catch {
    throw Object.assign(new Error("Cannot reach the local Flight Deck server. Check that it is running, then try again."), { ambiguous: true });
  }
  const requestId = response.headers.get("X-Request-Id");
  let data;
  try { data = await response.json(); } catch {
    throw Object.assign(new Error("The server returned an unreadable response. Refresh the workspace before continuing."), { requestId, status: response.status, ambiguous: true });
  }
  if (!response.ok) throw Object.assign(new Error(data.error?.message || `Request failed (${response.status}).`), {
    status: response.status, code: data.error?.code, requestId: data.requestId || requestId, ambiguous: response.status >= 500,
  });
  $("#connection-state").textContent = `LOCAL API / LAST RESPONSE ${time(new Date().toISOString())} UTC`;
  return { ...data, requestId };
}
const json = (body) => JSON.stringify(body);
const airport = (code) => state.network?.airports.find((item) => item.code === code);
const flight = (id) => state.network?.flights.find((item) => item.id === id);
function empty(title, detail) {
  return node("div", { className: "empty-state" }, node("h3", {}, title), node("p", {}, detail));
}
function setStep(step) {
  for (const id of ["find", "fare", "book"]) {
    const element = $(`#step-${id}`);
    if (id === step) element.setAttribute("aria-current", "step");
    else element.removeAttribute("aria-current");
  }
}
function navigate(event) {
  const route = ["plan", "reservations", "operations", "journal", "learn"].includes(location.hash.slice(1)) ? location.hash.slice(1) : "plan";
  for (const view of document.querySelectorAll(".view")) view.hidden = view.id !== `view-${route}`;
  for (const link of document.querySelectorAll(".sidebar a")) {
    if (link.hash === `#${route}`) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  }
  const names = { plan: "Plan a journey", reservations: "Reservations", operations: "Departures", journal: "Event journal", learn: "Learn & build" };
  document.title = `WRE Flight Deck | ${names[route]}`;
  if (event?.type === "hashchange") $("#main").focus();
}
window.addEventListener("hashchange", navigate);
const themeButton = $("#theme-toggle");
function renderTheme() {
  const dark = document.documentElement.dataset.theme === "dark";
  themeButton.textContent = dark ? "Light mode" : "Dark mode";
  themeButton.setAttribute("aria-label", `${dark ? "Light" : "Dark"} mode: switch color theme`);
}
themeButton.addEventListener("click", () => {
  const theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = theme;
  const url = new URL(location.href);
  url.searchParams.set("scoutTheme", theme);
  history.replaceState(null, "", url);
  renderTheme();
});

async function loadNetwork() {
  const result = await api("/api/network");
  state.network = result;
  $("#scenario-date").textContent = date(result.scenarioDate);
  $("#board-date").textContent = date(result.scenarioDate);
  const oldOrigin = $("#origin").value;
  const oldDestination = $("#destination").value;
  for (const id of ["origin", "destination"]) {
    $(`#${id}`).replaceChildren(...result.airports.map((item) => node("option", { value: item.code }, `${item.code} · ${item.city}`)));
    $(`#${id}`).disabled = false;
  }
  $("#origin").value = oldOrigin || result.airports[0]?.code || "";
  const defaultDestination = result.flights.find((item) => item.origin === $("#origin").value && item.destination !== $("#origin").value)?.destination;
  $("#destination").value = oldDestination || defaultDestination || result.airports[1]?.code || "";
  $("#swap-airports").disabled = false;
  $("#search-button").disabled = false;
  if (!state.search) feedback("#search-feedback", "Direct flights and one-stop connections. Fictional schedule, real availability.");
  renderMap();
  renderDepartures();
  return result;
}
function renderMap() {
  const { airports, flights } = state.network;
  const svg = svgNode("svg", { viewBox: "0 0 840 390", role: "img", "aria-labelledby": "map-title map-desc" });
  svg.append(svgNode("title", { id: "map-title" }, "WRE regional route network"));
  svg.append(svgNode("desc", { id: "map-desc" }, `Approximate United States geography. Airports: ${airports.map((a) => `${a.code}, ${a.city}`).join("; ")}. Route equivalents are in the expandable text list below. Highlighted lines show the selected itinerary, if any.`));
  for (let x = 70; x < 820; x += 94) svg.append(svgNode("path", { class: "map-grid", d: `M${x} 32V350` }));
  for (let y = 55; y < 350; y += 68) svg.append(svgNode("path", { class: "map-grid", d: `M40 ${y}H810` }));
  // Original schematic outline; deliberately not an aeronautical chart.
  svg.append(svgNode("path", { class: "map-land", d: "M61 65 96 73 114 63 154 78 205 78 252 83 293 89 334 89 380 91 420 90 458 98 483 89 510 98 530 87 548 103 567 109 582 100 596 117 609 107 628 117 646 104 658 82 675 75 688 53 710 49 719 69 735 73 740 99 769 106 781 122 765 135 751 145 734 144 728 161 711 172 703 190 684 204 674 223 655 240 638 252 639 281 654 309 650 337 636 335 620 309 606 292 586 288 566 283 541 282 520 293 495 283 477 279 464 292 452 315 433 323 415 304 399 276 377 264 352 270 329 258 307 252 281 245 260 231 233 224 207 218 192 207 171 207 152 188 131 169 111 139 94 121 79 105 65 91Z" }));
  const project = (item) => ({ x: 52 + ((item.lon + 125) / 59) * 730, y: 38 + ((50 - item.lat) / 26) * 315 });
  const points = airports.map(project);
  if (points.length) {
    const minX = Math.min(...points.map((point) => point.x));
    const maxX = Math.max(...points.map((point) => point.x));
    const minY = Math.min(...points.map((point) => point.y));
    const maxY = Math.max(...points.map((point) => point.y));
    svg.setAttribute("viewBox", `${minX - 42} ${minY - 38} ${Math.max(290, maxX - minX + 128)} ${Math.max(220, maxY - minY + 92)}`);
  }
  const selectedIds = new Set(state.selected?.flightIds || []);
  const grouped = new Map();
  for (const item of flights) {
    const key = [item.origin, item.destination].sort().join("-");
    const existing = grouped.get(key);
    if (!existing || selectedIds.has(item.id)) grouped.set(key, item);
  }
  const sorted = [...grouped.values()].sort((a, b) => Number(selectedIds.has(a.id)) - Number(selectedIds.has(b.id)));
  for (const item of sorted) {
    const from = airport(item.origin), to = airport(item.destination);
    if (!from || !to) continue;
    const a = project(from), b = project(to);
    const curve = Math.min(60, Math.abs(b.x - a.x) * .16 + 16);
    svg.append(svgNode("path", { class: `map-route${selectedIds.has(item.id) ? " active" : ""}`, d: `M${a.x} ${a.y} Q${(a.x + b.x) / 2} ${(a.y + b.y) / 2 - curve} ${b.x} ${b.y}` }));
  }
  const selectedAirports = new Set((state.selected?.flightIds || []).flatMap((id) => { const item = flight(id); return item ? [item.origin, item.destination] : []; }));
  for (const item of airports) {
    const point = project(item), active = selectedAirports.has(item.code);
    if (active) svg.append(svgNode("circle", { cx: point.x, cy: point.y, r: 12, class: "map-airport-ring" }));
    svg.append(svgNode("circle", { cx: point.x, cy: point.y, r: 5, class: `map-airport${active ? " active" : ""}` }));
    const alignLeft = point.x > 735 || item.code === "LAX";
    const below = item.code === "PDX" || item.code === "SJC";
    const labelY = point.y + (below ? 20 : item.code === "SLC" ? 0 : -12);
    const labelX = point.x + (alignLeft ? -12 : item.code === "SLC" ? 8 : 12);
    svg.append(svgNode("text", { x: labelX, y: labelY, "text-anchor": alignLeft ? "end" : "start", class: "map-code" }, item.code));
    svg.append(svgNode("text", { x: labelX, y: labelY + 18, "text-anchor": alignLeft ? "end" : "start", class: "map-city" }, item.city));
  }
  $("#network-map").replaceChildren(svg);
  const routes = [...new Set(flights.map((item) => `${item.origin} to ${item.destination}`))];
  $("#network-routes").replaceChildren(node("p", {}, airports.map((item) => `${item.code}: ${item.name}, ${item.city}`).join(" · ")), node("p", {}, `Scheduled routes: ${routes.join("; ")}.`));
}

$("#swap-airports").addEventListener("click", () => {
  [$("#origin").value, $("#destination").value] = [$("#destination").value, $("#origin").value];
});
$("#search-form").addEventListener("submit", (event) => {
  event.preventDefault();
  searchFlights();
});
async function searchFlights({ silent = false } = {}) {
  if (state.attempt) {
    feedback("#search-feedback", "A booking is awaiting a confirmed response. Retry that booking before starting another journey.", "error");
    return;
  }
  const search = { origin: $("#origin").value, destination: $("#destination").value, passengers: Number($("#passengers").value) };
  if (search.origin === search.destination) {
    feedback("#search-feedback", "Choose two different airports for your journey.", "error");
    return;
  }
  const sequence = ++state.searchSequence;
  $("#search-button").disabled = true;
  $("#search-button").textContent = "Finding flights…";
  feedback("#search-feedback", "Checking routes and available seats…");
  $("#itineraries").setAttribute("aria-busy", "true");
  try {
    const result = await api(`/api/itineraries?${new URLSearchParams(search)}`);
    if (sequence !== state.searchSequence) return;
    state.search = search;
    state.itineraries = result.itineraries;
    if (!silent) { state.selected = null; state.quote = null; setStep("find"); renderFare(); renderMap(); }
    renderItineraries();
    feedback("#search-feedback", `${result.itineraries.length} ${result.itineraries.length === 1 ? "option" : "options"} for ${search.passengers} ${search.passengers === 1 ? "passenger" : "passengers"}. All times UTC.`);
  } catch (error) {
    feedback("#search-feedback", errorText(error), "error");
  } finally {
    $("#search-button").disabled = !state.network;
    $("#search-button").replaceChildren("Find flights ", node("span", { "aria-hidden": "true" }, "↗"));
    $("#itineraries").removeAttribute("aria-busy");
  }
}
function renderItineraries() {
  $("#results-count").textContent = `${state.itineraries.length} ${state.itineraries.length === 1 ? "route" : "routes"} available`;
  $("#results-title").textContent = state.search ? `${state.search.origin} to ${state.search.destination}` : "Your flight options";
  if (!state.itineraries.length) {
    $("#itineraries").replaceChildren(empty("No connections this time.", "Try another airport pair or fewer passengers. Departed flights and routes without enough seats are not available."));
    return;
  }
  $("#itineraries").replaceChildren(...state.itineraries.map((item) => {
    const legs = item.flightIds.map(flight).filter(Boolean);
    const chosen = state.selected?.id === item.id;
    const choose = node("button", { type: "button", "data-testid": "itinerary-select", className: `choose-button ${chosen ? "primary-button" : "secondary-button"}`, "aria-pressed": chosen, "aria-label": `${chosen ? "Selected" : "Review fare"}: ${time(item.departure)} flight from ${item.origin} to ${item.destination}`, onClick: () => selectItinerary(item) }, chosen ? "Selected" : "Review fare", node("span", { "aria-hidden": "true" }, chosen ? "✓" : "↗"));
    return node("article", { className: `itinerary${chosen ? " selected" : ""}`, "data-testid": "itinerary-option", "data-itinerary-id": item.id },
      node("div", { className: "itinerary-top" },
        node("div", { className: "itinerary-route" },
          node("div", { className: "airport-time" }, node("strong", {}, time(item.departure)), node("span", {}, item.origin)),
          node("div", { className: "connection-line" }, duration(item.durationMinutes), node("i", { "aria-hidden": "true" }), item.stops ? `${item.stops} stop · ${legs[0]?.destination || "connection"}` : "Nonstop"),
          node("div", { className: "airport-time" }, node("strong", {}, time(item.arrival)), node("span", {}, item.destination))),
        node("div", { className: "itinerary-price" }, node("strong", {}, money(item.baseFareCents)), node("small", {}, "base / passenger"))),
      node("div", { className: "itinerary-bottom" }, node("p", { className: "itinerary-detail" },
        node("span", {}, `${legs.map((leg) => leg.number).join(" / ")} · ${item.availableSeats} seats left`),
        node("span", {}, `${date(item.departure)} · ${legs.map((leg) => leg.aircraft).join(" / ")}`)), choose));
  }));
}
function selectItinerary(item) {
  if (state.attempt) {
    feedback("#global-feedback", "Retry the pending booking to resolve its outcome before selecting a different fare.", "error");
    return;
  }
  state.selected = item;
  state.quote = null;
  setStep("fare");
  renderItineraries();
  renderFare();
  renderMap();
  revealAndFocus("#bags");
}
function renderFare() {
  if (!state.selected) {
    $("#fare-content").replaceChildren(node("div", { className: "fare-placeholder" }, node("span", {}, "02 / 03"), node("h3", {}, "One step at a time."), node("p", {}, "Select a flight to add bags, apply a coupon, and see an exact price before booking."), node("div", { className: "ticket-perforation", "aria-hidden": "true" }), node("small", {}, "Fictional bookings. No payment details.")));
    return;
  }
  const item = state.selected;
  const inner = node("div", { className: "fare-inner" },
    node("h3", { className: "route-summary" }, item.origin, node("span", { "aria-hidden": "true" }, "→"), item.destination),
    node("p", { className: "fare-meta" }, `${time(item.departure)} UTC · ${state.search.passengers} ${state.search.passengers === 1 ? "passenger" : "passengers"}`));
  const bags = node("select", { id: "bags", name: "bags", "data-testid": "quote-bags" }, ...[0, 1, 2].map((n) => node("option", { value: n }, `${n} ${n === 1 ? "bag" : "bags"} / passenger`)));
  const coupon = node("input", { id: "coupon", name: "coupon", "data-testid": "quote-coupon", type: "text", placeholder: "e.g. FIRSTFLIGHT", maxlength: 40, autocomplete: "off", spellcheck: "false" });
  if (state.quote) { bags.value = state.quote.bagsPerPassenger; coupon.value = state.quote.coupon || ""; }
  const quoteButton = node("button", { className: "secondary-button wide", type: "submit", "data-testid": "quote-submit" }, state.quote ? "Update fare" : "Calculate fare", node("span", { "aria-hidden": "true" }, "→"));
  const quoteFeedback = node("p", { id: "quote-feedback", className: "form-feedback", role: "status", "aria-live": "polite" });
  const quoteForm = node("form", { className: "fare-form", onSubmit: async (event) => {
    event.preventDefault();
    if (state.attempt) return;
    quoteButton.disabled = true;
    bags.disabled = true;
    coupon.disabled = true;
    quoteButton.textContent = "Calculating…";
    feedback(quoteFeedback, "Getting an exact fare from the pricing service…");
    try {
      const result = await api("/api/quotes", { method: "POST", body: json({ flightIds: item.flightIds, passengers: state.search.passengers, bagsPerPassenger: Number(bags.value), coupon: coupon.value.trim() }) });
      if (state.selected !== item) return;
      state.quote = result.quote;
      setStep("book");
      renderFare();
      revealAndFocus("#callsign");
    } catch (error) {
      feedback(quoteFeedback, errorText(error), "error");
      quoteButton.disabled = false;
      bags.disabled = false;
      coupon.disabled = false;
      quoteButton.textContent = state.quote ? "Update fare" : "Calculate fare";
    }
  } }, node("label", { for: "bags" }, "Checked bags"), bags,
    node("span", { className: "field-hint" }, "Included baggage and fees are shown in your quote."),
    node("label", { for: "coupon" }, "Coupon (optional)"), coupon, quoteButton, quoteFeedback);
  inner.append(quoteForm);
  if (state.quote) {
    const quote = state.quote;
    const breakdown = node("dl", { className: "fare-lines", "aria-label": "Price breakdown in US dollars" },
      ...quote.lines.map((line) => node("div", { className: "fare-line" }, node("dt", {}, line.label), node("dd", {}, money(line.amountCents)))),
      node("div", { className: "fare-line" }, node("dt", {}, "Subtotal"), node("dd", {}, money(quote.subtotalCents))),
      node("div", { className: "fare-line" }, node("dt", {}, quote.coupon ? `Discount · ${quote.coupon}` : "Discount"), node("dd", {}, money(quote.discountCents ? -quote.discountCents : 0))),
      node("div", { className: "fare-line" }, node("dt", {}, "Fictional service tax"), node("dd", {}, money(quote.taxCents))),
      node("div", { className: "fare-line total" }, node("dt", {}, "Total · USD"), node("dd", {}, money(quote.totalCents))));
    inner.append(node("div", { className: "ticket-perforation", "aria-hidden": "true" }), breakdown,
      node("p", { className: "quote-expiry" }, `Fare held until ${time(quote.expiresAt)} UTC on ${date(quote.expiresAt)}. Includes fictional service tax.`));
    const callsign = node("input", { id: "callsign", name: "callsign", "data-testid": "booking-callsign", type: "text", minlength: 2, maxlength: 24, required: true, placeholder: "e.g. TEAM-ORBIT", autocomplete: "off", "aria-describedby": "callsign-hint" });
    if (state.attempt) callsign.value = state.attempt.callsign;
    const bookButton = node("button", { id: "book-button", "data-testid": "booking-submit", type: "submit", className: "primary-button wide" }, state.attempt ? "Retry same booking" : "Confirm fictional booking", node("span", { "aria-hidden": "true" }, "↗"));
    const bookFeedback = node("p", { id: "book-feedback", className: "form-feedback", role: "status", "aria-live": "polite" });
    const bookingForm = node("form", { className: "booking-form", onSubmit: (event) => { event.preventDefault(); bookJourney(callsign, bookButton, bookFeedback); } },
      node("label", { for: "callsign" }, "Fictional team callsign"), callsign,
      node("span", { id: "callsign-hint", className: "field-hint" }, "2-24 characters. Use a synthetic team name, not a person's name."), bookButton, bookFeedback);
    const invalidate = () => {
      state.quote = null;
      setStep("fare");
      bookingForm.remove();
      breakdown.remove();
      inner.querySelector(".quote-expiry")?.remove();
      feedback(quoteFeedback, "Your fare details changed. Calculate the fare again before booking.");
      quoteButton.textContent = "Calculate fare";
    };
    bags.addEventListener("change", invalidate, { once: true });
    coupon.addEventListener("input", invalidate, { once: true });
    inner.append(bookingForm);
    if (state.attempt) {
      callsign.disabled = true; bags.disabled = true; coupon.disabled = true; quoteButton.disabled = true;
      feedback(bookFeedback, "The previous booking response is unconfirmed. Retry uses the same request key and cannot allocate seats twice.");
    }
  }
  $("#fare-content").replaceChildren(inner);
}
async function bookJourney(callsign, button, status) {
  if (!state.quote) return;
  if (!state.attempt) state.attempt = { quoteId: state.quote.id, callsign: callsign.value.trim(), key: `wre-${crypto.randomUUID()}` };
  const attempt = state.attempt;
  callsign.disabled = true;
  button.disabled = true;
  $("#bags").disabled = true;
  $("#coupon").disabled = true;
  $(".fare-form button").disabled = true;
  button.textContent = "Confirming booking…";
  feedback(status, "Allocating seats across every leg. Please wait…");
  try {
    const result = await api("/api/bookings", { method: "POST", headers: { "Idempotency-Key": attempt.key }, body: json({ quoteId: attempt.quoteId, callsign: attempt.callsign }) });
    state.attempt = null;
    const booking = result.booking;
    $("#fare-content").replaceChildren(node("div", { className: "fare-inner" },
      node("span", { className: "success-mark", "aria-hidden": "true" }, "✓"),
      node("p", { className: "eyebrow" }, "BOOKING CONFIRMED"), node("h3", {}, `You're on board, ${booking.callsign}.`),
      node("p", { className: "booking-reference" }, booking.reference),
      node("p", { className: "fare-meta" }, `${booking.passengers} ${booking.passengers === 1 ? "passenger" : "passengers"} · ${money(booking.quote.totalCents)} USD`),
      node("p", { className: "field-hint" }, "This is a fictional reservation. No real ticket has been issued."),
      node("div", { className: "ticket-perforation", "aria-hidden": "true" }),
      node("a", { href: "#reservations" }, "View reservations →"),
      node("small", { className: "request-id" }, `Request ID: ${result.requestId || "not supplied"}`)));
    feedback("#global-feedback", `Booking ${booking.reference} confirmed for ${booking.callsign}.`);
    revealAndFocus("#fare-content a");
    await refreshRelated();
  } catch (error) {
    if (!error.ambiguous) {
      state.attempt = null;
      callsign.disabled = false;
      $("#bags").disabled = false;
      $("#coupon").disabled = false;
      $(".fare-form button").disabled = false;
      button.textContent = "Try booking again";
      if (error.status === 409 || error.status === 410) {
        state.quote = null;
        button.disabled = true;
        $(".fare-form button").textContent = "Get a fresh fare";
      } else button.disabled = false;
      feedback(status, `${errorText(error)}${error.status === 409 || error.status === 410 ? " Get a fresh fare and review availability before trying again." : ""}`, "error");
      await refreshRelated();
    } else {
      button.textContent = "Retry same booking";
      button.disabled = false;
      feedback(status, `${errorText(error)} The outcome is unconfirmed. Retry this same booking; its request key is retained to prevent duplicate reservations.`, "error");
    }
  }
}
async function loadBookings() {
  const result = await api("/api/bookings");
  state.bookings = result.bookings;
  renderBookings();
  return result;
}
function renderBookings() {
  if (!state.bookings.length) {
    $("#bookings-list").replaceChildren(empty("No teams booked yet.", "Plan a journey and confirm a fare to create your first fictional reservation."), node("a", { href: "#plan" }, "Find a route →"));
    return;
  }
  $("#bookings-list").replaceChildren(...state.bookings.map((booking) => {
    const legs = booking.flightIds.map(flight).filter(Boolean);
    const status = node("p", { className: "form-feedback reservation-feedback", role: "status", "aria-live": "polite" });
    const actions = node("div", { className: "reservation-actions" });
    const cancelButton = node("button", { type: "button", className: "secondary-button", "data-testid": "booking-cancel", onClick: () => {
      actions.replaceChildren(node("span", { className: "subtle" }, "Release this team's seats?"),
        node("button", { type: "button", onClick: async (event) => {
          event.currentTarget.disabled = true;
          feedback(status, "Cancelling reservation…");
          try {
            const result = await api(`/api/bookings/${encodeURIComponent(booking.id)}/cancel`, { method: "POST", body: json({ version: booking.version }) });
            feedback("#global-feedback", `Reservation ${result.booking.reference} cancelled. Seats have been released.`);
            await refreshRelated();
          } catch (error) {
            await refreshRelated();
            feedback("#bookings-feedback", `${errorText(error)}${error.status === 409 ? " Reservations have been refreshed. Review the current booking before trying again." : " Refresh reservations to verify the current state before retrying."}`, "error");
          }
        } }, "Confirm cancellation"),
        node("button", { type: "button", className: "quiet-button", onClick: () => actions.replaceChildren(cancelButton) }, "Keep booking"));
      revealAndFocus(actions.querySelector("button"));
    } }, "Cancel reservation");
    if (booking.status !== "cancelled") actions.append(cancelButton);
    return node("article", { className: "reservation", "data-testid": "booking-row", "data-booking-id": booking.id },
      node("div", {}, node("p", { className: "eyebrow" }, booking.callsign), node("h2", {}, booking.reference),
        node("p", {}, `${legs.length ? `${legs[0].origin} → ${legs.at(-1).destination}` : booking.flightIds.join(" / ")} · ${booking.passengers} ${booking.passengers === 1 ? "passenger" : "passengers"} · ${money(booking.quote.totalCents)}`),
        node("p", { className: "subtle" }, `${legs.map((leg) => leg.number).join(" / ")} · Created ${date(booking.createdAt)} · Version ${booking.version}`),
        node("p", {}, node("span", { className: `status-tag ${booking.status}` }, booking.status))),
      actions, status);
  }));
}
function renderDepartures() {
  if (!state.network) return;
  const table = node("table", {}, node("caption", { className: "skip-link" }, `Fictional departures on ${date(state.network.scenarioDate)}, all times UTC`),
    node("thead", {}, node("tr", {}, ...["UTC", "FLIGHT", "ROUTE", "GATE", "STATUS", "SEATS", "EDIT"].map((heading) => node("th", { scope: "col" }, heading)))));
  table.append(node("tbody", {}, ...state.network.flights.map((item) => node("tr", { className: state.flight?.id === item.id ? "selected" : "" },
    node("td", {}, node("strong", {}, time(item.departure))), node("td", {}, item.number),
    node("td", {}, `${item.origin} → ${item.destination}`), node("td", {}, item.gate || "Unassigned"),
    node("td", {}, node("span", { className: `status-tag ${item.status}` }, item.status)), node("td", {}, `${item.availableSeats}/${item.capacity}`),
    node("td", {}, node("button", { type: "button", className: "table-button", "aria-label": `Edit ${item.number}, ${item.origin} to ${item.destination}`, onClick: () => {
      state.flight = item; renderDepartures(); renderFlightEditor(); revealAndFocus("#flight-status");
    } }, "Edit", node("span", { "aria-hidden": "true" }, "↗")))))));
  $("#departure-board").replaceChildren(table);
}
function renderFlightEditor(message = "") {
  const item = state.flight;
  if (!item) return;
  const options = { scheduled: ["scheduled", "delayed", "boarding"], delayed: ["delayed", "scheduled", "boarding"], boarding: ["boarding", "departed"], departed: ["departed"] };
  const status = node("select", { id: "flight-status", name: "status" }, ...(options[item.status] || [item.status]).map((value) => node("option", { value }, value[0].toUpperCase() + value.slice(1))));
  const gate = node("input", { id: "flight-gate", name: "gate", value: item.gate || "", placeholder: "e.g. A12", pattern: "[A-Za-z][0-9]{2}", maxlength: 3, "aria-describedby": "gate-hint", autocomplete: "off" });
  const feedbackNode = node("p", { className: "form-feedback", role: "status", "aria-live": "polite" }, message);
  const submit = node("button", { type: "submit", className: "primary-button wide" }, "Save departure", node("span", { "aria-hidden": "true" }, "↗"));
  if (item.status === "departed") { gate.disabled = true; status.disabled = true; submit.disabled = true; }
  const form = node("form", { onSubmit: async (event) => {
    event.preventDefault();
    submit.disabled = true;
    feedback(feedbackNode, "Saving departure…");
    try {
      const result = await api(`/api/flights/${encodeURIComponent(item.id)}`, { method: "PATCH", body: json({ version: item.version, status: status.value, gate: gate.value.trim().toUpperCase() }) });
      state.flight = result.flight;
      await refreshRelated();
      renderFlightEditor(`Saved ${result.flight.number}. Version ${result.flight.version}. Request ID: ${result.requestId || "not supplied"}.`);
    } catch (error) {
      if (error.status === 409) {
        try {
          await loadNetwork();
          state.flight = flight(item.id);
          renderDepartures();
          renderFlightEditor(`${errorText(error)} Loaded the current departure. Review its gate and status, then save again.`);
        } catch (refreshError) {
          feedback(feedbackNode, `${errorText(error)} Refresh also failed: ${errorText(refreshError)} Use Refresh schedule before retrying.`, "error");
        }
      } else {
        feedback(feedbackNode, `${errorText(error)}${error.ambiguous ? " Refresh the schedule to verify whether the change was saved before retrying." : ""}`, "error");
        submit.disabled = Boolean(error.ambiguous);
      }
    }
  } }, node("p", { className: "route-summary" }, item.number), node("p", { className: "fare-meta" }, `${item.origin} → ${item.destination} · ${time(item.departure)} UTC · v${item.version}`),
    node("label", { for: "flight-status" }, "Departure status"), status,
    node("label", { for: "flight-gate" }, "Gate"), gate, node("span", { id: "gate-hint", className: "field-hint" }, "A01-Z99. A gate is required for boarding or departure."),
    item.status === "departed" ? node("p", { className: "field-hint" }, "This flight has departed. Further changes are not allowed.") : null, submit, feedbackNode);
  $("#flight-editor").replaceChildren(form);
  if (message) {
    const target = item.status === "departed" ? $("#ops-editor-title") : status;
    if (item.status === "departed") target.tabIndex = -1;
    revealAndFocus(target);
  }
}
async function loadEvents() {
  const result = await api("/api/events");
  $("#events-list").replaceChildren(...(result.events.length ? result.events.map((event) => node("article", { className: "event" },
    node("time", { datetime: event.at }, `${date(event.at)} · ${time(event.at)} UTC`),
    node("div", {}, node("h2", {}, event.type.replaceAll(/[._-]/g, " ")), node("p", {}, typeof event.detail === "string" ? event.detail : Object.entries(event.detail || {}).map(([key, value]) => `${key}: ${typeof value === "object" ? JSON.stringify(value) : value}`).join(" · ")),
      node("span", { className: "request-id" }, `Entity: ${event.entityId} · Event: ${event.id}`),
      node("span", { className: "request-id" }, `Request ID: ${event.requestId || "not supplied"}`))))
    : [empty("A clean slate.", "Confirm a booking, cancel a reservation, or update a departure. Its actual application event will appear here.")]));
  return result;
}
async function refreshRelated() {
  const results = await Promise.allSettled([loadNetwork(), loadBookings(), loadEvents()]);
  const failures = results.filter((result) => result.status === "rejected");
  if (failures.length) feedback("#global-feedback", `The action response was received, but some panels could not refresh. Data may be stale. ${failures.map((result) => errorText(result.reason)).join(" ")}`, "error");
  if (state.search && !state.attempt) {
    try {
      const result = await api(`/api/itineraries?${new URLSearchParams(state.search)}`);
      state.itineraries = result.itineraries;
      renderItineraries();
    } catch (error) { feedback("#search-feedback", `Flight options may be stale. ${errorText(error)}`, "error"); }
  }
}
async function refreshButton(button, action, target) {
  const original = button.textContent;
  button.disabled = true; button.textContent = "Refreshing…";
  try { await action(); feedback(target, "Refreshed from the local API."); }
  catch (error) { feedback(target, errorText(error), "error"); }
  finally { button.disabled = false; button.textContent = original; }
}
$("#refresh-bookings").addEventListener("click", (event) => refreshButton(event.currentTarget, loadBookings, "#bookings-feedback"));
$("#refresh-events").addEventListener("click", (event) => refreshButton(event.currentTarget, loadEvents, "#events-feedback"));
$("#refresh-flights").addEventListener("click", (event) => refreshButton(event.currentTarget, async () => {
  const selectedId = state.flight?.id;
  await loadNetwork();
  if (selectedId) { state.flight = flight(selectedId); renderDepartures(); renderFlightEditor("Current version loaded. Review the departure before saving."); }
}, "#global-feedback"));

const repositoryUrl = "https://github.com/msfttoler/wre-flight-deck";
$("#repository-link").href = repositoryUrl;
$("#week-links").replaceChildren(...Array.from({ length: 12 }, (_, index) => {
  const week = String(index + 1).padStart(2, "0");
  return node("li", {}, node("a", { href: `${repositoryUrl}/blob/main/docs/week-${week}.md`, target: "_blank", rel: "noopener noreferrer" }, node("span", {}, week), `Session ${week}`, node("span", { "aria-hidden": "true" }, "↗")));
}));
for (const [selector, testId] of Object.entries({
  "#origin": "origin", "#destination": "destination", "#passengers": "passengers",
  "#search-button": "search-flights", "#theme-toggle": "theme-toggle",
  '.sidebar a[href="#reservations"]': "nav-reservations",
  '.sidebar a[href="#operations"]': "nav-operations",
  '.sidebar a[href="#journal"]': "nav-journal",
})) $(selector).setAttribute("data-testid", testId);
async function initialize() {
  navigate(); renderTheme();
  $("#bookings-list").replaceChildren(empty("Loading reservations…", "Reading the current workspace."));
  $("#events-list").replaceChildren(empty("Loading the journal…", "Reading recorded application events."));
  const results = await Promise.allSettled([loadNetwork(), loadBookings(), loadEvents()]);
  if (results[0].status === "fulfilled") feedback("#search-feedback", "Direct flights and one-stop connections. Fictional schedule, real availability.");
  else {
    feedback("#search-feedback", errorText(results[0].reason), "error");
    $("#scenario-date").textContent = "Schedule unavailable";
    $("#origin").replaceChildren(node("option", { value: "" }, "Schedule unavailable"));
    $("#destination").replaceChildren(node("option", { value: "" }, "Schedule unavailable"));
    $("#network-map").replaceChildren(empty("Schedule unavailable.", "Use Departures > Refresh schedule to reconnect to the local API."));
    feedback("#global-feedback", "Could not load the schedule. The app has not substituted sample data. Use Departures > Refresh schedule to retry.", "error");
  }
  if (results[1].status === "rejected") {
    $("#bookings-list").replaceChildren(empty("Reservations unavailable.", "Refresh reservations to try the local API again."));
    feedback("#bookings-feedback", errorText(results[1].reason), "error");
  }
  if (results[2].status === "rejected") {
    $("#events-list").replaceChildren(empty("Journal unavailable.", "Refresh the journal to try the local API again."));
    feedback("#events-feedback", errorText(results[2].reason), "error");
  }
}
initialize();
