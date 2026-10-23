# ByteBridge UI contract

Reference: the supplied dark portfolio screenshot, specifically its editorial hero, stacked service rows with an orange feature, and paired education/work panels. Adapt the hierarchy and contrast to ByteBridge's existing nonprofit concept; preserve its identity, photography, content, and routes.

- Job: explain the digital-learning mission and offer a clear path to explore or donate.
- Primary action: donation; secondary action: explore the existing mission and About page.
- Palette: #0D0D0D canvas, #171717 sections, #202020 cards, #FF9F0A accents, #FFB340 hover, #F5F5F5 text, #A3A3A3 secondary text. Orange controls use dark text.
- Structure: floating pill navigation, oversized editorial hero, orange-framed learning photography, stacked numbered program rows, paired mission/vision panels, compact footer. Use local Inter and Plus Jakarta Sans fonts.
- Behavior: working learning-tip disclosures, active navigation, accessible mobile menu, Stripe amount lifecycle and status states. Style payment fields through Stripe's Appearance API.
- Motion: 180–220ms hover/press feedback, 450–600ms entrance reveals, staggered cards; respect reduced motion and avoid continuous movement.
- Responsive: stack hero and paired panels on mobile; reflow service rows; preserve 44px touch targets and readable text. Verify 320, 375, 430, 768, 1024, 1280, 1440, and 1920px.
- Required states: hover, focus, pressed, selected, disabled, payment loading, unavailable, error, processing, success. Keep status messages and request behavior intact.
- Reject: copied portfolio branding, fabricated statistics/testimonials, light leftover surfaces, decorative buttons, excessive gradients, and unrelated backend changes.
