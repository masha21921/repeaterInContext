// Demo data for Repeater × Context (Harmony = CMS, Studio = seamless / e-com / bookends)
// Unsplash URLs (used with their license)
const us = (id) => `https://images.unsplash.com/photo-${id}?w=400&h=300&fit=crop`;
const placeholderImg = (label) =>
  `https://placehold.co/400x300/5f6368/ffffff?text=${encodeURIComponent(String(label).slice(0, 20))}`;

/** Placeholder content for a repeater before it’s connected (team profiles, not recipes) */
export const unconfiguredRepeaterItems = [
  { id: 't1', title: 'Alex Morgan', image: placeholderImg('Alex Morgan'), buttonText: 'View profile' },
  { id: 't2', title: 'Jordan Lee', image: placeholderImg('Jordan Lee'), buttonText: 'View profile' },
  { id: 't3', title: 'Sam Chen', image: placeholderImg('Sam Chen'), buttonText: 'View profile' },
  { id: 't4', title: 'Riley Kim', image: placeholderImg('Riley Kim'), buttonText: 'View profile' },
  { id: 't5', title: 'Casey Taylor', image: placeholderImg('Casey Taylor'), buttonText: 'View profile' },
  { id: 't6', title: 'Jamie Wright', image: placeholderImg('Jamie Wright'), buttonText: 'View profile' },
];

/** Recipes – each item has name, image, description, course, detailPage (Recipe Details Dynamic page URL) */
export const recipesCollectionItems = [
  { id: 'r1', title: 'Pizza', image: placeholderImg('Pizza'), description: 'Classic dough with tomato sauce and mozzarella.', buttonText: 'Read recipe', course: 'lunch', detailPage: '/recipe/pizza' },
  { id: 'r2', title: 'Hummus', image: placeholderImg('Hummus'), description: 'Creamy chickpea dip with tahini and lemon.', buttonText: 'Read recipe', course: 'dinner', detailPage: '/recipe/hummus' },
  { id: 'r3', title: 'Apple pie', image: placeholderImg('Apple pie'), description: 'Warm spiced apples in a flaky crust.', buttonText: 'Read recipe', course: 'dinner', detailPage: '/recipe/apple-pie' },
  { id: 'r4', title: 'Italian pasta', image: placeholderImg('Italian pasta'), description: 'Al dente pasta with basil and parmesan.', buttonText: 'Read recipe', course: 'lunch', detailPage: '/recipe/italian-pasta' },
  { id: 'r5', title: 'Asian stir-fry', image: placeholderImg('Asian stir-fry'), description: 'Quick vegetables and protein in a savory sauce.', buttonText: 'Read recipe', course: 'lunch', detailPage: '/recipe/asian-stir-fry' },
  { id: 'r6', title: 'Fruit salad', image: placeholderImg('Fruit salad'), description: 'Fresh seasonal fruits with a light dressing.', buttonText: 'Read recipe', course: 'breakfast', detailPage: '/recipe/fruit-salad' },
  { id: 'r7', title: 'Classic burger', image: placeholderImg('Classic burger'), description: 'Juicy beef patty with lettuce, tomato, and pickles.', buttonText: 'Read recipe', course: 'lunch', detailPage: '/recipe/classic-burger' },
  { id: 'r8', title: 'Scrambled eggs', image: placeholderImg('Scrambled eggs'), description: 'Fluffy eggs with butter and a pinch of salt.', buttonText: 'Read recipe', course: 'breakfast', detailPage: '/recipe/scrambled-eggs' },
  { id: 'r9', title: 'Avocado toast', image: placeholderImg('Avocado toast'), description: 'Smashed avocado on toasted sourdough.', buttonText: 'Read recipe', course: 'breakfast', detailPage: '/recipe/avocado-toast' },
  { id: 'r10', title: 'Pancakes', image: placeholderImg('Pancakes'), description: 'Stack of fluffy buttermilk pancakes with syrup.', buttonText: 'Read recipe', course: 'breakfast', detailPage: '/recipe/pancakes' },
];

export const cmsCollectionItems = [
  { id: '1', title: 'Getting Started with CMS', slug: 'getting-started-cms', status: 'Published', _updatedDate: '2024-02-20' },
  { id: '2', title: 'Design System Best Practices', slug: 'design-system-best-practices', status: 'Draft', _updatedDate: '2024-02-18' },
  { id: '3', title: 'Repeater and Context', slug: 'repeater-and-context', status: 'Published', _updatedDate: '2024-02-22' },
];

export const seamlessCollectionItems = [
  { id: 'a', label: 'Item A', value: 100 },
  { id: 'b', label: 'Item B', value: 200 },
  { id: 'c', label: 'Item C', value: 150 },
];

export const ecomItems = [
  { id: 'p1', name: 'Wireless Headphones', price: 89.99, sku: 'WH-001', inStock: true, image: us('1505740420928-9c82560d3b1e') },
  { id: 'p2', name: 'USB-C Hub', price: 49.99, sku: 'UB-002', inStock: true, image: us('1558618666-fcd25f4d2f2f') },
  { id: 'p3', name: 'Desk Lamp', price: 34.99, sku: 'DL-003', inStock: false, image: us('1507473882165-eeafe8f6e475') },
];

export const bookendsItems = [
  { id: 'b1', title: 'The Art of Code', author: 'Jane Smith', isbn: '978-0-123-45678-9', image: us('1497633762265-9d179a246325') },
  { id: 'b2', title: 'Design Systems', author: 'Alex Chen', isbn: '978-0-987-65432-1', image: us('1512820790801-25012b4d4162') },
  { id: 'b3', title: 'Context and Repeaters', author: 'Team Editor', isbn: '978-0-111-22233-4', image: us('1544947950-fa07a98d844f') },
];

/** Offices (buildings / workspaces) */
export const officesCollectionItems = [
  { id: 'o1', name: 'Barcelona Office', code: 'BCN', description: 'Nestled in the heart of the city...', image: us('1497366216548-37526070297c') },
  { id: 'o2', name: 'Berlin Office', code: 'BER', description: 'Located by the Spree in...', image: us('1523241595016-b461eef17a24') },
  { id: 'o3', name: 'Paris Office', code: 'PAR', description: 'In a quiet corner of the 1st...', image: us('1486406146926-63bbf8d80faf') },
];

/** Films – title, year, poster, description, director, detailPage */
export const filmsCollectionItems = [
  { id: 'f1', title: 'The Midnight Runner', year: 2022, image: placeholderImg('The Midnight Runner'), description: 'A thriller about a long-distance runner who witnesses a crime.', director: 'Elena Cruz', detailPage: '/film/the-midnight-runner' },
  { id: 'f2', title: 'Silent Echoes', year: 2021, image: placeholderImg('Silent Echoes'), description: 'In a world without sound, one woman finds her voice.', director: 'Marcus Webb', detailPage: '/film/silent-echoes' },
  { id: 'f3', title: 'Glass Horizon', year: 2023, image: placeholderImg('Glass Horizon'), description: 'Architects compete to build the first transparent skyscraper.', director: 'Yuki Tanaka', detailPage: '/film/glass-horizon' },
  { id: 'f4', title: 'Last Letter', year: 2020, image: placeholderImg('Last Letter'), description: 'A writer discovers letters that change everything.', director: 'Sofia Mendes', detailPage: '/film/last-letter' },
  { id: 'f5', title: 'Neon Gardens', year: 2022, image: placeholderImg('Neon Gardens'), description: 'In 2145, the last garden on Earth holds a secret.', director: 'James Okonkwo', detailPage: '/film/neon-gardens' },
];

/** Actors – name, image, bio, detailPage */
export const actorsCollectionItems = [
  { id: 'a1', name: 'Emma Walsh', image: placeholderImg('Emma Walsh'), bio: 'Award-winning lead in drama and sci-fi. Known for The Midnight Runner.', detailPage: '/actor/emma-walsh' },
  { id: 'a2', name: 'David Chen', image: placeholderImg('David Chen'), bio: 'Stage and screen actor. Breakout role in Silent Echoes.', detailPage: '/actor/david-chen' },
  { id: 'a3', name: 'Zara Okoye', image: placeholderImg('Zara Okoye'), bio: 'Director and performer. Glass Horizon, Neon Gardens.', detailPage: '/actor/zara-okoye' },
  { id: 'a4', name: 'Lucas Berg', image: placeholderImg('Lucas Berg'), bio: 'European cinema star. Last Letter, festival favourite.', detailPage: '/actor/lucas-berg' },
  { id: 'a5', name: 'Maya Patel', image: placeholderImg('Maya Patel'), bio: 'Rising talent in indie and blockbuster films.', detailPage: '/actor/maya-patel' },
];

/**
 * Context = "source" assignable to page, section, or repeater.
 * Used in settings panels to show "Available contexts" when selecting page/section/repeater.
 */
export const availableContexts = [
  { id: 'recipes', type: 'recipes', label: 'Recipes', source: 'CMS/Recipes collection', items: recipesCollectionItems },
  { id: 'team', type: 'recipes', label: 'Team', source: 'CMS/Team', items: unconfiguredRepeaterItems },
  { id: 'offices', type: 'offices', label: 'Offices', source: 'CMS/Offices', items: officesCollectionItems },
  { id: 'films', type: 'films', label: 'Films', source: 'CMS/Films collection', items: filmsCollectionItems },
  { id: 'actors', type: 'actors', label: 'Actors', source: 'CMS/Actors collection', items: actorsCollectionItems },
  { id: 'seamless', type: 'seamless', label: 'Seamless collection', source: 'Seamless', items: seamlessCollectionItems },
  { id: 'stores', type: 'e-com', label: 'Stores', source: 'Stores', items: ecomItems },
  { id: 'bookends', type: 'bookends', label: 'Bookends', source: 'Bookends', items: bookendsItems },
];

/** Placeholder items for Studio repeater presets when not connected (by topic). */
const unconfiguredProductsItems = ecomItems.map((p) => ({
  id: p.id,
  title: p.name,
  image: p.image,
  buttonText: 'View product',
}));

/** Returns placeholder items for a repeater preset (Studio Add component presets). */
export function getUnconfiguredItemsForPreset(preset) {
  switch (preset) {
    case 'recipes':
      return recipesCollectionItems;
    case 'products':
      return unconfiguredProductsItems;
    case 'team':
      return unconfiguredRepeaterItems;
    case 'blank':
      return [];
    default:
      return unconfiguredRepeaterItems;
  }
}

/**
 * Default item bindings when a repeater is connected to a collection (out-of-the-box).
 * Applied to all items of that context so text/image/button map to the first sensible field.
 */
export function getDefaultItemBindingsForContext(contextId) {
  const byContext = {
    recipes: {
      boundField: 'title',
      boundFieldImage: 'image',
      boundFieldButtonLink: 'detailPage',
    },
    team: {
      boundField: 'title',
      boundFieldImage: 'image',
      boundFieldButtonLink: 'detailPage',
    },
    offices: {
      boundField: 'name',
      boundFieldImage: 'image',
      boundFieldButtonLink: 'detailPage',
    },
    films: {
      boundField: 'title',
      boundFieldImage: 'image',
      boundFieldButtonLink: 'detailPage',
    },
    actors: {
      boundField: 'name',
      boundFieldImage: 'image',
      boundFieldButtonLink: 'detailPage',
    },
  };
  return byContext[contextId] ?? {
    boundField: 'title',
    boundFieldImage: 'image',
    boundFieldButtonLink: 'detailPage',
  };
}

/** For Connect Collection modal: New collection = Team (preset). When user connects Team, it becomes Existing. */
export const connectModalPresetIds = ['team'];
export const connectModalExistingOrder = ['offices', 'recipes'];
export const connectModalExistingLabels = {};

/** Connect Context modal: categories and options (id = contextId, label = display in modal). */
export const connectContextCategories = [
  {
    id: 'cms',
    label: 'CMS',
    options: [
      { id: 'recipes', label: 'Recipe collection' },
      { id: 'films', label: 'Films collection' },
      { id: 'actors', label: 'Actors collection' },
      { id: 'team', label: 'Team' },
      { id: 'offices', label: 'Offices' },
    ],
  },
  {
    id: 'wixStores',
    label: 'Wix Stores',
    options: [
      { id: 'stores', label: 'Product list' },
      { id: 'productInventory', label: 'Product inventory' },
    ],
  },
  {
    id: 'system',
    label: 'System',
    options: [
      { id: 'identity', label: 'Identity' },
      { id: 'pageList', label: 'Page list' },
      { id: 'businessInfo', label: 'Business info' },
    ],
  },
  {
    id: 'custom',
    label: 'Custom',
    options: [
      { id: 'seamless', label: 'My Context' },
      { id: 'bookends', label: 'Bookends' },
    ],
  },
];
