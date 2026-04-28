import { useMemo, useState } from 'react'
import { Link, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeftOutlined,
  SearchOutlined,
  UserOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons'
import {
  Breadcrumb,
  Button,
  ConfigProvider,
  Empty,
  Input,
  Select,
  Tag,
} from 'antd'
import data from '../data.json'

const categoryOrder = ['Cars', 'Bikes', 'Phones', 'Computers']

const categoryLabel = {
  Cars: 'CARS',
  Bikes: 'BIKES',
  Phones: 'SMART',
  Computers: 'LAPTOPS',
}

/* ─── Shared Navbar ────────────────────────────────────────────────────── */
function Navbar({ searchText, onSearch, category, onCategoryChange }) {
  const showFilters = typeof onSearch === 'function'

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto flex flex-wrap items-center gap-3 px-3 py-3 sm:h-14 sm:flex-nowrap sm:gap-4 sm:px-4 sm:py-0 md:gap-8 md:px-8 max-w-7xl">
        {/* Logo */}
        <Link to="/" className="shrink-0 no-underline">
          <span className="text-lg font-black tracking-tight text-gray-900 sm:text-xl">
            CATALOG<span className="text-blue-600">.</span>
          </span>
        </Link>

        {/* Right icons – stay on top row on mobile */}
        <nav className="order-2 ml-auto flex shrink-0 items-center gap-3 text-sm text-gray-700 sm:order-3 sm:gap-4">
          <button className="flex items-center gap-1 hover:text-blue-600">
            <UserOutlined />
            <span className="hidden sm:inline">Account</span>
          </button>
          <button className="flex items-center gap-1 hover:text-blue-600">
            <ShoppingCartOutlined />
            <span className="hidden sm:inline">Cart</span>
          </button>
        </nav>

        {/* Search + Category – wraps to own row on mobile */}
        {showFilters && (
          <div className="order-3 flex w-full items-center gap-2 sm:order-2 sm:flex-1 sm:gap-3">
            <Input
              prefix={<SearchOutlined className="text-gray-400" />}
              placeholder="Search"
              value={searchText}
              onChange={(e) => onSearch?.(e.target.value)}
              allowClear
              className="flex-1 sm:max-w-md"
            />
            <Select
              value={category ?? 'All'}
              onChange={(v) => onCategoryChange?.(v)}
              className="w-32 shrink-0 sm:w-44"
              options={[
                { label: 'All Categories', value: 'All' },
                ...categoryOrder.map((c) => ({ label: c, value: c })),
              ]}
            />
          </div>
        )}
      </div>
    </header>
  )
}

/* ─── Single Product Card ──────────────────────────────────────────────── */
function ProductCard({ item, fullWidth = false }) {
  return (
    <Link to={`/item/${item.id}`} className="no-underline">
      <div className={`group overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-md ${fullWidth ? 'w-full' : 'w-36 shrink-0 sm:w-44 md:w-52'}`}>
        <div className="h-28 overflow-hidden bg-gray-50 sm:h-32 md:h-36">
          <img
            src={item.image}
            alt={item.itemname}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="p-3">
          <p className="truncate text-sm font-semibold text-gray-900">{item.itemname}</p>
          <p className="mt-0.5 text-xs text-gray-400">
            {item.itemprops.length} attribute{item.itemprops.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </Link>
  )
}

/* ─── Category Row ─────────────────────────────────────────────────────── */
function CategoryRow({ category, items }) {
  const label = categoryLabel[category] ?? category.toUpperCase()

  return (
    <section className="mb-8">
      <div className="mb-3 flex items-baseline gap-2">
        <h2 className="text-xl font-bold text-gray-900">{category}</h2>
        <span className="text-sm text-gray-400">
          ({label}&nbsp;{items.length}&nbsp;Items)
        </span>
        <Link
          to={`/?cat=${encodeURIComponent(category)}`}
          className="ml-auto text-sm font-medium text-blue-600 no-underline hover:underline"
        >
          View All
        </Link>
      </div>

      {/* Mobile: 2-col grid (vertical scroll). Tablet+: horizontal strip */}
      <div className="grid grid-cols-2 gap-3 sm:hidden">
        {items.map((item) => (
          <ProductCard key={item.id} item={item} fullWidth />
        ))}
      </div>
      <div
        className="hidden gap-3 overflow-x-auto pb-3 sm:flex"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((item) => (
          <ProductCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}

/* ─── Home Page ────────────────────────────────────────────────────────── */
function HomePage() {
  const [searchText, setSearchText] = useState('')

  // optional ?cat= filter from "View All" links seeds the dropdown
  const initialCat = useMemo(
    () => new URLSearchParams(window.location.search).get('cat') || 'All',
    [],
  )
  const [category, setCategory] = useState(initialCat)

  const allItems = useMemo(
    () => data.map((item, idx) => ({ ...item, id: String(idx) })),
    [],
  )

  const catalog = useMemo(() => {
    const q = searchText.trim().toLowerCase()

    const grouped = {}
    for (const item of allItems) {
      if (category !== 'All' && item.category !== category) continue
      const match =
        q.length === 0 ||
        item.itemname.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      if (!match) continue
      grouped[item.category] = grouped[item.category] ?? []
      grouped[item.category].push(item)
    }

    return categoryOrder
      .filter((c) => grouped[c]?.length > 0)
      .map((c) => ({ category: c, items: grouped[c] }))
  }, [allItems, searchText, category])

  return (
    <div className="min-h-screen bg-white">
      <Navbar
        searchText={searchText}
        onSearch={setSearchText}
        category={category}
        onCategoryChange={setCategory}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        {catalog.length === 0 ? (
          <div className="mt-20 flex justify-center">
            <Empty description="No products found" />
          </div>
        ) : (
          catalog.map(({ category, items }) => (
            <CategoryRow key={category} category={category} items={items} />
          ))
        )}
      </main>
    </div>
  )
}

/* ─── Detail Page ──────────────────────────────────────────────────────── */
function DetailPage() {
  const { itemId } = useParams()
  const navigate = useNavigate()
  const item = data[Number(itemId)]
  const selected = item ? { ...item, id: String(itemId) } : null

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1)
    else navigate('/')
  }

  if (!selected) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="mt-24 flex justify-center">
          <Empty description="Item not found">
            <Link to="/">
              <Button type="primary" className="mt-4">Back to Catalog</Button>
            </Link>
          </Empty>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-8">
        {/* Back button + Breadcrumb */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
            className="rounded-lg!"
          >
            Back
          </Button>
          <Breadcrumb
            className="mb-0!"
            items={[
              { title: <Link to="/">Home</Link> },
              { title: selected.category },
              { title: selected.itemname },
            ]}
          />
        </div>

        {/* Two-column layout */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2">

            {/* Left – image panel */}
            <div className="flex items-center justify-center bg-gray-50 p-4 sm:p-6 md:p-8 lg:min-h-96">
              <img
                src={selected.image}
                alt={selected.itemname}
                className="max-h-64 w-full rounded-xl object-contain sm:max-h-80"
              />
            </div>

            {/* Right – details panel */}
            <div className="flex flex-col gap-5 border-t border-gray-200 p-5 sm:p-6 lg:border-t-0 lg:border-l lg:p-8">
              {/* Title + tags */}
              <div>
                <h1 className="text-2xl font-black leading-tight text-gray-900 sm:text-3xl">
                  {selected.itemname}
                </h1>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Tag className="rounded-full">Category:&nbsp;{selected.category}</Tag>
                </div>
              </div>

              {/* Dynamic attributes table */}
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">
                  Dynamic Attributes
                </p>
                <div className="overflow-hidden rounded-xl border border-gray-200">
                  {selected.itemprops.map((prop, idx) => (
                    <div
                      key={`${prop.label}-${idx}`}
                      className={`flex items-center justify-between px-4 py-3 text-sm ${
                        idx < selected.itemprops.length - 1
                          ? 'border-b border-gray-100'
                          : ''
                      }`}
                    >
                      <span className="text-gray-500">{prop.label}</span>
                      <span className="font-semibold text-gray-900">{prop.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <Button
                type="primary"
                size="large"
                block
                className="mt-auto rounded-xl! font-semibold"
              >
                Add to Catalog
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

/* ─── App Shell ─────────────────────────────────────────────────────────── */
function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#2563eb',
          borderRadius: 10,
          fontFamily:
            'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        },
      }}
    >
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/item/:itemId" element={<DetailPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ConfigProvider>
  )
}

export default App
