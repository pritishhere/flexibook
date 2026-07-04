import { Link } from 'react-router-dom';
import heroBg from './family-bg.png';
import { serviceCategories } from './data/categories';

const valueCards = [
  {
    title: 'For customers',
    description: 'Find services, check availability, book appointments, and join live queues from one place.',
    label: 'Book smarter',
    colorClass: 'bg-blue-50 text-blue-600 border-blue-100',
  },
  {
    title: 'For businesses',
    description: 'Publish services, manage slots, reduce crowding, and give customers clearer updates.',
    label: 'Run smoother',
    colorClass: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  },
  {
    title: 'For everyday schedules',
    description: 'Replace uncertain waiting time with cleaner planning across healthcare, dining, fitness, travel, and more.',
    label: 'Save time',
    colorClass: 'bg-amber-50 text-amber-700 border-amber-100',
  },
];

const flowSteps = [
  {
    title: 'Discover',
    description: 'Search across trusted local services and compare what is available around you.',
  },
  {
    title: 'Reserve',
    description: 'Choose an appointment slot or queue option that fits your day.',
  },
  {
    title: 'Arrive ready',
    description: 'Use clear status and next-slot details to spend less time waiting.',
  },
];

const AboutPage = () => {
  return (
    <div className="w-full min-h-screen overflow-x-hidden bg-white font-sans">
      <section
        className="relative min-h-[72vh] flex items-center bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-white/90 md:bg-white/80 lg:bg-gradient-to-r lg:from-white/95 lg:via-white/85 lg:to-white/20"></div>
        <div className="relative z-10 max-w-screen-2xl mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-16 md:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 font-semibold px-4 py-1.5 rounded-full text-xs sm:text-sm mb-6 border border-blue-100 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              Built for smarter appointment days
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12] mb-6">
              We help people skip uncertainty and book time with confidence.
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-slate-700 leading-relaxed max-w-2xl mb-8 font-medium">
              FlexiBook brings appointments, live queues, and service discovery into one simple experience for customers and businesses.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/categories"
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-lg active:scale-[0.98]"
              >
                Explore Categories
              </Link>
              <Link
                to="/customers"
                className="inline-flex items-center justify-center rounded-lg border-2 border-blue-600 bg-white px-6 py-3 text-sm font-bold text-blue-600 transition-all hover:bg-blue-50 active:scale-[0.98]"
              >
                Browse Services
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-100 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { value: '5,000+', label: 'users served' },
              { value: `${serviceCategories.length}`, label: 'service categories' },
              { value: '2', label: 'booking modes' },
              { value: '1', label: 'simpler workflow' },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-5 text-center shadow-sm">
                <div className="text-2xl font-black text-slate-900 md:text-3xl">{item.value}</div>
                <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <p className="text-sm font-bold uppercase tracking-wide text-blue-600 mb-3">Our mission</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
              Make local services easier to find, book, and manage.
            </h2>
            <p className="text-slate-600 leading-relaxed text-base md:text-lg">
              Waiting should not be the default. FlexiBook gives customers a clearer path to the services they need while helping businesses organize demand, appointments, and queues with less friction.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {valueCards.map((card) => (
              <div key={card.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg">
                <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${card.colorClass}`}>
                  {card.label}
                </span>
                <h3 className="mt-5 text-xl font-bold text-slate-900">{card.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-blue-600 mb-3">How it works</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
                A cleaner flow from search to service.
              </h2>
              <p className="text-slate-600 leading-relaxed">
                The product is built around the same everyday pattern: choose a service, reserve time, and arrive with better visibility. Businesses get a simpler way to organize demand; customers get their time back.
              </p>
            </div>

            <div className="grid gap-4">
              {flowSteps.map((step, index) => (
                <div key={step.title} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-sm font-black text-white shadow-md shadow-blue-100">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{step.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#0B1120] py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-blue-300 mb-3">Ready when you are</p>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-4">
                Find the right category and book your next slot.
              </h2>
              <p className="max-w-2xl text-slate-400 leading-relaxed">
                From healthcare and salons to dining, travel, home services, and logistics, FlexiBook is designed to keep everyday bookings moving.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/categories"
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-blue-500 active:scale-[0.98]"
              >
                View Categories
              </Link>
              <Link
                to="/business-register"
                className="inline-flex items-center justify-center rounded-lg border border-slate-600 px-6 py-3 text-sm font-bold text-slate-100 transition-all hover:border-blue-400 hover:text-blue-300 active:scale-[0.98]"
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

export default AboutPage;
