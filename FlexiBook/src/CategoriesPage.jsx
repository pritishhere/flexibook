import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCategoryUrl, serviceCategories } from './data/categories';

const bookingHeroImage = 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=1800&q=80';

const CategoriesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCategories = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) return serviceCategories;

    return serviceCategories.filter((category) => {
      const searchableText = [
        category.name,
        category.summary,
        category.description,
        ...category.examples,
      ].join(' ').toLowerCase();

      return searchableText.includes(query);
    });
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <section
        className="relative overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: `url(${bookingHeroImage})`, backgroundPosition: 'center right' }}
      >
        <div className="absolute inset-0 bg-slate-950/65"></div>
        <div className="relative z-10 max-w-screen-2xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-16 md:py-24">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-blue-100 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              All service categories
            </div>

            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl leading-[1.12]">
              Browse every type of booking FlexiBook supports.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-200 md:text-lg">
              Explore healthcare, salons, auto care, dining, education, fitness, travel, logistics, and more. Pick a category to jump straight into matching services.
            </p>
          </div>

          <div className="mt-10 max-w-3xl rounded-2xl border border-white/20 bg-white/95 p-2 shadow-2xl shadow-slate-950/20 backdrop-blur-md">
            <div className="flex items-center gap-3 px-4 py-3">
              <svg className="h-5 w-5 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"></path>
              </svg>
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search categories, services, or examples..."
                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 md:text-base"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="rounded-lg px-3 py-1.5 text-xs font-bold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-blue-600">Categories</p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
                {filteredCategories.length} service areas available
              </h2>
            </div>
            <Link
              to="/customers"
              className="inline-flex w-fit items-center justify-center rounded-lg border border-blue-200 bg-white px-4 py-2.5 text-sm font-bold text-blue-600 shadow-sm transition-all hover:bg-blue-50 active:scale-[0.98]"
            >
              View all services
            </Link>
          </div>

          {filteredCategories.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredCategories.map((category) => (
                <Link
                  key={category.name}
                  to={getCategoryUrl(category.name)}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
                >
                  <div className="relative h-48 overflow-hidden bg-slate-200">
                    <div className={`absolute inset-0 bg-gradient-to-br ${category.accentClass} opacity-90`}></div>
                    <img
                      src={category.image}
                      alt={category.name}
                      onError={(event) => {
                        event.currentTarget.style.display = 'none';
                      }}
                      className="relative z-10 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 z-20 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4 z-30 flex items-end justify-between gap-3">
                      <div>
                        <span className="inline-flex rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-slate-700 shadow-sm backdrop-blur-sm">
                          {category.shortName}
                        </span>
                        <h3 className="mt-3 text-xl font-black text-white">
                          {category.name}
                        </h3>
                      </div>
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r ${category.accentClass} text-sm font-black text-white shadow-lg`}>
                        {category.name.slice(0, 1)}
                      </div>
                    </div>
                  </div>

                  <div className="p-5">
                    <p className="text-sm leading-relaxed text-slate-600">
                      {category.description}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {category.examples.map((example) => (
                        <span
                          key={example}
                          className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600 transition-colors group-hover:border-blue-200 group-hover:bg-blue-50 group-hover:text-blue-700"
                        >
                          {example}
                        </span>
                      ))}
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                      <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        {category.stat}
                      </span>
                      <span className="inline-flex items-center gap-1 text-sm font-black text-blue-600">
                        Browse
                        <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-black text-slate-900">No category found</h3>
              <p className="mt-2 text-sm text-slate-500">
                Try a different service name, category, or example.
              </p>
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-700"
              >
                Reset search
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-blue-50 via-white to-emerald-50 p-6 shadow-sm md:p-8">
            <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
                  Need to list your own business?
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
                  Register your business to manage services, appointments, availability, and customer queues through FlexiBook.
                </p>
              </div>
              <Link
                to="/business-register"
                className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md active:scale-[0.98]"
              >
                Register Business
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CategoriesPage;
