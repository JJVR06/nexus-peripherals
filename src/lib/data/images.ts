/**
 * Verified real product photography (Unsplash). Each ID was checked to load and
 * to show the correct subject. Products are assigned photos from their category
 * pool; anything that fails to load degrades to a clean placeholder at runtime.
 */
const U = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=75`;

export const categoryImages: Record<string, string[]> = {
  keyboards: [U("1595225476474-87563907a212"), U("1618384887929-16ec33fab9ef")],
  mice: [U("1615663245857-ac93bb7c39e7"), U("1527814050087-3793815479db")],
  headsets: [U("1599669454699-248893623440"), U("1618366712010-f4ae9c647dcb")],
  monitors: [U("1593305841991-05c297ba4575"), U("1527443224154-c4a3942d3acf")],
  mousepads: [U("1616763355548-1b606f439f86"), U("1511467687858-23d96c32e4ae")],
  controllers: [U("1592840496694-26d035b52b48"), U("1600080972464-8e5f35f63d08")],
  microphones: [U("1590602847861-f357a9332bbc")],
  webcams: [U("1500726726099-3f759a2eaa99")],
  chairs: [U("1592078615290-033ee584e267"), U("1542751371-adc38448a05e")],
};

/** Large, dark/moody setup shots used for the home hero carousel. */
export const heroImages = {
  battlestation: U("1598550476439-6847785fcea6"),
  monitor: U("1593305841991-05c297ba4575"),
  desk: U("1616763355548-1b606f439f86"),
};

/**
 * Deterministically give each product up to two photos from its category pool,
 * rotating by position so products within a category don't all look identical.
 */
export function assignCategoryImages<
  T extends { categorySlug: string; images: string[] },
>(items: T[]): T[] {
  const counters: Record<string, number> = {};
  for (const item of items) {
    if (item.images.length > 0) continue;
    const pool = categoryImages[item.categorySlug];
    if (!pool || pool.length === 0) continue;
    const n = counters[item.categorySlug] ?? 0;
    counters[item.categorySlug] = n + 1;
    item.images =
      pool.length > 1
        ? [pool[n % pool.length], pool[(n + 1) % pool.length]]
        : [pool[0]];
  }
  return items;
}
