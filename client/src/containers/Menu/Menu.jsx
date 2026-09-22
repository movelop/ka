import React, { useState, useEffect } from 'react';
import { HiOutlineSearch } from 'react-icons/hi';

import { Footer, HeadingSmall } from '../../components';
import { images } from '../../Data/dummy';
import './menu.css';

// ─── Kitchen Data ──────────────────────────────────────────────────────────────

const SWALLOW_COMBOS = [
  {
    title: 'Pounded Yam + Soup',
    items: [
      { name: 'Pounded Yam + Egusi Soup', price: 4000 },
      { name: 'Pounded Yam + Efo Riro',   price: 4000 },
    ],
  },
  {
    title: 'Semo + Soup',
    items: [
      { name: 'Semo + Egusi Soup', price: 3500 },
      { name: 'Semo + Efo Riro',   price: 3500 },
    ],
  },
  {
    title: 'Eba (Garri) + Soup',
    items: [
      { name: 'Eba + Egusi Soup', price: 3500 },
      { name: 'Eba + Efo Riro',   price: 3500 },
    ],
  },
  {
    title: 'Noodles Combos',
    items: [
      { name: 'Noodles + Egg',               price: 2500 },
      { name: 'Noodles + Chicken Drumstick', price: 6500 },
      { name: 'Noodles + Turkey Wings',      price: 6000 },
    ],
  },
];

const KITCHEN_CATEGORIES = [
  {
    category: 'Rice Meals',
    items: [
      { name: 'Rice + Beef + Stew',              price: 3000 },
      { name: 'Rice + Fish + Stew',               price: 5000 },
      { name: 'Rice + Assorted Meat + Stew',      price: 4000 },
      { name: 'Rice + Chicken Drumstick + Stew',  price: 7000 },
      { name: 'Rice + Turkey Drum + Stew',        price: 7000 },
      { name: 'Rice + Turkey Wings + Stew',       price: 6500 },
    ],
  },
  {
    category: 'Extras & Add-ons',
    items: [
      { name: 'Rice and Stew',        price: 2000 },
      { name: 'Jollof Rice',          price: 2500 },
      { name: 'Fried Rice',           price: 2500 },
      { name: 'Coleslaw',             price: 1000 },
      { name: 'Egusi Soup',           price: 2500 },
      { name: 'Efo Riro',             price: 2500 },
      { name: 'Plantain',             price: 1500 },
      { name: 'Yam and Egg Sauce',    price: 5000 },
      { name: 'Yam Porridge',         price: 4000 },
      { name: 'Chicken Drum',         price: 5000 },
      { name: 'Chicken Laps',         price: 4500 },
      { name: 'Turkey Drum',          price: 5000 },
      { name: 'Turkey Wings',         price: 4500 },
      { name: 'Chinese Rice',         price: 6000 },
      { name: 'Noodles and Omelet',   price: 2500 },
      { name: 'Noodles',              price: 1500 },
      { name: 'Egg',                  price: 1000 },
      { name: 'Chicken Pepper Soup',  price: 6000 },
      { name: 'Cow Tail Pepper Soup', price: 3500 },
      { name: 'Assorted',             price: 3000 },
    ],
  },
];

// ─── Bar Data ──────────────────────────────────────────────────────────────────

const BAR_CATEGORIES = [
  {
    category: 'Soft Drinks',
    items: [
      { name: 'Water (75cl)',       price: 500  },
      { name: 'Coke',                price: 800  },
      { name: 'Fanta',               price: 800  },
      { name: 'Sprite',              price: 800  },
      { name: 'Maltina',             price: 1000 },
      { name: '5 Alive',             price: 2500 },
      { name: 'Chivita',             price: 3000 },
      { name: 'Hollandia Yoghurt',   price: 3500 },
      { name: 'Dudu Yoghurt',        price: 1200 },
      { name: 'Lacoco',              price: 1000 },
      { name: 'Jekonmo',             price: 1000 },
    ],
  },
  {
    category: 'Energy Drinks',
    items: [
      { name: 'Monster',                 price: 2500 },
      { name: 'Black Bullet',            price: 2500 },
      { name: 'Action Bitters (Bottle)', price: 5000 },
      { name: 'Origin Pet (Bottle)',     price: 6000 },
      { name: 'Origin Pet',              price: 1500 },
      { name: 'Predator',                price: 800  },
      { name: 'Fearless',                price: 800  },
      { name: 'Supa Komando',            price: 500  },
    ],
  },
  {
    category: 'Beer & Stout',
    items: [
      { name: 'Heineken',            price: 2000 },
      { name: 'Desperado',           price: 2000 },
      { name: 'Goldberg',            price: 1200 },
      { name: 'Trophy',              price: 1200 },
      { name: 'Trophy Stout',        price: 2000 },
      { name: 'Big Stout',           price: 2200 },
      { name: 'Turbo King',          price: 1500 },
      { name: 'Smirnoff Ice (Small)',price: 1000 },
      { name: 'Smirnoff Ice (Big)',  price: 2000 },
      { name: 'Budweiser',           price: 1500 },
    ],
  },
  {
    category: 'Whiskey',
    items: [
      { name: 'Johnnie Walker Red Label', price: 35000 },
      { name: "Jack Daniel's",            price: 45000 },
      { name: 'Jameson',                  price: 45000 },
      { name: 'Best Whiskey (Small)',     price: 2000  },
      { name: 'Best Whiskey (Big)',       price: 8000  },
      { name: 'Imperial Blue (Small)',    price: 2000  },
      { name: 'Imperial Blue (Big)',      price: 8000  },
    ],
  },
  {
    category: 'Champagne',
    items: [
      { name: 'André Rosé',   price: 25000 },
      { name: 'Joven',        price: 15000 },
      { name: 'Four Cousins', price: 15000 },
    ],
  },
  {
    category: 'Rum, Gin & Cognac',
    items: [
      { name: 'Bacardi White',       price: 30000  },
      { name: "Gordon's Gin",        price: 10000  },
      { name: "Gordon's Orange Gin", price: 12000  },
      { name: 'Big Ben',             price: 5000   },
      { name: 'Hennessy V.S.O.P',    price: 175000 },
      { name: 'Hennessy Cognac',     price: 40000  },
      { name: 'Sierra',              price: 28000  },
    ],
  },
  {
    category: 'Aperitifs',
    items: [
      { name: 'Campari (Big)',    price: 40000 },
      { name: 'Campari (Medium)', price: 32000 },
    ],
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (n) => `₦${n.toLocaleString()}`;

// ─── Sub-components ────────────────────────────────────────────────────────────

const MenuItemRow = ({ name, price, compact }) => (
  <div className={`menuItemRow${compact ? ' menuItemRow--compact' : ''}`}>
    <span className="menuItemRow__name">{name}</span>
    <span className="menuItemRow__leader" />
    <span className="menuItemRow__price">{fmt(price)}</span>
  </div>
);

const CategorySection = ({ category, items, search }) => {
  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );
  if (!filtered.length) return null;

  return (
    <div className="menuCategory">
      <span className="menuCategory__label">{category}</span>
      <div className="menuCategory__list">
        {filtered.map((item, i) => (
          <MenuItemRow key={i} name={item.name} price={item.price} />
        ))}
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────

const Menu = () => {
  useEffect(() => {
    document.title = "K.A Hotel & Suites — Kitchen & Bar";
  }, []);

  const [section, setSection] = useState('kitchen'); // 'kitchen' | 'bar'
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = section === 'kitchen'
    ? ['All', 'Swallow & Soup', ...KITCHEN_CATEGORIES.map((c) => c.category)]
    : ['All', ...BAR_CATEGORIES.map((c) => c.category)];

  const handleSectionChange = (s) => {
    setSection(s);
    setActiveCategory('All');
    setSearch('');
  };

  const showCombos =
    section === 'kitchen' &&
    (activeCategory === 'All' || activeCategory === 'Swallow & Soup') &&
    (SWALLOW_COMBOS.some((c) =>
      c.items.some((i) => i.name.toLowerCase().includes(search.toLowerCase()))
    ) || !search);

  const hasResults = section === 'kitchen'
    ? KITCHEN_CATEGORIES.some((c) =>
        (activeCategory === 'All' || activeCategory === c.category) &&
        c.items.some((i) => i.name.toLowerCase().includes(search.toLowerCase()))
      ) || SWALLOW_COMBOS.some((c) =>
        c.items.some((i) => i.name.toLowerCase().includes(search.toLowerCase()))
      )
    : BAR_CATEGORIES.some((c) =>
        (activeCategory === 'All' || activeCategory === c.category) &&
        c.items.some((i) => i.name.toLowerCase().includes(search.toLowerCase()))
      );

  return (
    <div>
      <HeadingSmall text="Kitchen & Bar" img={images.menu} />

      <div className="menu">
        <div className="menuContainer">

          {/* ── Intro ── */}
          <div className="menuTop">
            <span className="menuTop__eyebrow">On The Menu</span>
            <h3>Kitchen &amp; Bar</h3>
            <p>
              Delicious meals and a curated drinks list, made to order and
              served with care. Browse the categories below, or search for
              something specific.
            </p>
          </div>

          {/* ── Controls ── */}
          <div className="menuControls">
            <div className="menuTabs">
              <button
                className={`menuTabs__tab${section === 'kitchen' ? ' active' : ''}`}
                onClick={() => handleSectionChange('kitchen')}
              >
                Kitchen
              </button>
              <button
                className={`menuTabs__tab${section === 'bar' ? ' active' : ''}`}
                onClick={() => handleSectionChange('bar')}
              >
                Bar
              </button>
            </div>

            <div className="menuSearch">
              <HiOutlineSearch className="menuSearch__icon" />
              <input
                type="text"
                placeholder={`Search ${section === 'kitchen' ? 'food' : 'drinks'}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* ── Category filters ── */}
          <div className="menuFilters">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`menuFilters__pill${activeCategory === cat ? ' active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* ── Content ── */}
          <div className="menuBody">
            {section === 'kitchen' && (
              <>
                {showCombos && (
                  <div className="menuCategory">
                    <span className="menuCategory__label">Swallow &amp; Soup Combos</span>
                    <div className="menuCombos">
                      {SWALLOW_COMBOS.map((combo, i) => {
                        const items = combo.items.filter((item) =>
                          item.name.toLowerCase().includes(search.toLowerCase())
                        );
                        if (!items.length) return null;
                        return (
                          <div key={i} className="menuCombo">
                            <h4>{combo.title}</h4>
                            {items.map((item, j) => (
                              <MenuItemRow key={j} name={item.name} price={item.price} compact />
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {KITCHEN_CATEGORIES
                  .filter((c) => activeCategory === 'All' || activeCategory === c.category)
                  .map((c) => (
                    <CategorySection
                      key={c.category}
                      category={c.category}
                      items={c.items}
                      search={search}
                    />
                  ))}
              </>
            )}

            {section === 'bar' &&
              BAR_CATEGORIES
                .filter((c) => activeCategory === 'All' || activeCategory === c.category)
                .map((c) => (
                  <CategorySection
                    key={c.category}
                    category={c.category}
                    items={c.items}
                    search={search}
                  />
                ))
            }

            {search && !hasResults && (
              <div className="menuEmpty">No items match &ldquo;{search}&rdquo;</div>
            )}
          </div>

          {/* ── Note ── */}
          <div className="menuNote">
            <p>
              {section === 'kitchen'
                ? <><strong>Please note:</strong> all meals are prepared fresh on order — please allow 15–30 minutes for preparation. For orders &amp; enquiries, please contact the Front Desk or dial <strong>815</strong> (Bar / Kitchen).</>
                : <><strong>Please note:</strong> all drinks are served responsibly. No sale of alcohol to persons under 18 years. For orders &amp; enquiries, call <strong>0816 123 4567</strong> or dial <strong>815</strong> (Bar / Kitchen).</>
              }
            </p>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Menu;