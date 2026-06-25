// src/pages/CustomerPage.jsx
import React, { useState, useEffect } from 'react';

const CustomerPage = () => {
  // ================= 1. STATES FOR ALL COMBINATIONS & UI =================
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState([]); 
  const [selectedPrices, setSelectedPrices] = useState([]);         
  const [selectedAvailability, setSelectedAvailability] = useState([]); 
  const [locationFilter, setLocationFilter] = useState('');         
  const [sortBy, setSortBy] = useState('Recommended');               
  
  // Sidebar Accordions
  const [openSections, setOpenSections] = useState({
    categories: true, location: true, sortBy: true, availability: true, price: true
  });
  const [isOthersOpen, setIsOthersOpen] = useState(false); 

  const itemsPerPage = 4;

  const mainCategories = ['Healthcare', 'Beauty & Wellness', 'Automotive', 'Food & Dining', 'Education', 'Fitness'];
  const otherCategories = ['Entertainment & Event Ticketing', 'Real Estate & Property Services', 'Home Repair & Maintenance', 'Travel & Booking', 'Courier & Logistics'];
  const allCategoriesList = [...mainCategories, ...otherCategories];
  const availabilityOptions = ['Available Now', 'Available Today', 'Available Tomorrow', 'Join Queue', 'Fully Booked'];

  // ================= 2. KEYBOARD SHORTCUT =================
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeTag = document.activeElement.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') return;
      if (e.key === 'Backspace' || e.key === 'Delete') handleClearAll();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ================= 3. DATA GENERATION =================
  const baseServices = [
    { id: 1, name: 'City Dental Clinic', verified: true, category: 'Dental Care • Healthcare', rating: '4.8', reviews: '128', distance: '0.8 km away', location: 'New York', desc: 'Comprehensive dental care for you and your family.', tags: ['Teeth Cleaning', 'Dental Checkup'], availabilityStatus: 'Available Now', nextAvailable: 'Available Now', priceValue: 40, price: '$40 Consultation', icon: '🦷' },
    { id: 2, name: 'Downtown Barbershop', verified: true, category: "Men's Grooming • Beauty & Wellness", rating: '4.7', reviews: '96', distance: '1.2 km away', location: 'Chicago', desc: 'Professional grooming services for men. Walk-ins welcome.', tags: ['Haircut', 'Beard Trim'], availabilityStatus: 'Available Today', nextAvailable: 'Today, 11:00 AM', priceValue: 20, price: '$20 Starting from', icon: '✂️' },
    { id: 3, name: 'Active Physiotherapy', verified: true, category: 'Physiotherapy • Healthcare', rating: '4.9', reviews: '64', distance: '1.5 km away', location: 'Miami', desc: 'Expert physiotherapy services to help you recover and stay active.', tags: ['Physiotherapy', 'Rehabilitation'], availabilityStatus: 'Available Tomorrow', nextAvailable: 'Tomorrow, 09:45 AM', priceValue: 60, price: '$60 Consultation', icon: '💆' },
    { id: 4, name: 'Bliss Spa & Wellness', verified: true, category: 'Spa • Beauty & Wellness', rating: '4.6', reviews: '78', distance: '2.0 km away', location: 'Los Angeles', desc: 'Relax and rejuvenate with our premium spa services.', tags: ['Massage', 'Facial'], availabilityStatus: 'Join Queue', nextAvailable: 'Queue: 3 people ahead', priceValue: 30, price: '$30 Starting from', icon: '🧘‍♀️' },
  ];

  const allServices = Array.from({ length: 200 }, (_, index) => {
    if (index < 4) return baseServices[index];
    const randomCategory = allCategoriesList[index % allCategoriesList.length]; 
    const availStatus = availabilityOptions[index % availabilityOptions.length];
    const numericPrice = 15 + (index % 7) * 15; 
    const locations = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami'];
    const serviceLocation = locations[index % locations.length];

    let nextAvailText = '';
    if (availStatus === 'Available Now') nextAvailText = 'Available Now';
    else if (availStatus === 'Available Today') nextAvailText = 'Today, 04:30 PM';
    else if (availStatus === 'Available Tomorrow') nextAvailText = 'Tomorrow, 10:00 AM';
    else if (availStatus === 'Join Queue') nextAvailText = `Queue: ${index % 5 + 2} people ahead`;
    else nextAvailText = 'No slots available';

    return {
      id: index + 1,
      name: `Premium Service ${index + 1}`,
      verified: index % 2 === 0,
      category: `General • ${randomCategory}`,
      rating: (4.0 + (index % 11) * 0.1).toFixed(1),
      reviews: 20 + index * 3,
      distance: `${(0.5 + (index % 10) * 0.7).toFixed(1)} km away`,
      location: serviceLocation,
      desc: `High-quality professional service tailored to your needs. Located in ${serviceLocation}.`,
      tags: ['Trusted', 'Fast Service', 'Professional'],
      availabilityStatus: availStatus,
      nextAvailable: nextAvailText,
      priceValue: numericPrice,
      price: `$${numericPrice} Starting from`,
      icon: randomCategory.includes('Health') ? '🦷' : randomCategory.includes('Beauty') ? '✂️' : randomCategory.includes('Auto') ? '🚗' : randomCategory.includes('Food') ? '🍔' : '✨'
    };
  });

  // ================= 4. FILTER ENGINE =================
  const filteredServices = allServices.filter((service) => {
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.some(cat => service.category.includes(cat));
    let matchesPrice = true;
    if (selectedPrices.length > 0) {
      matchesPrice = selectedPrices.some(range => {
        if (range === 'Under $20') return service.priceValue < 20;
        if (range === '$20 - $50') return service.priceValue >= 20 && service.priceValue <= 50;
        if (range === '$50 - $100') return service.priceValue >= 50 && service.priceValue <= 100;
        if (range === 'Above $100') return service.priceValue > 100;
        return false;
      });
    }
    const matchesAvailability = selectedAvailability.length === 0 || selectedAvailability.includes(service.availabilityStatus);
    const matchesLocation = locationFilter.trim() === '' || service.location.toLowerCase().includes(locationFilter.toLowerCase()) || service.desc.toLowerCase().includes(locationFilter.toLowerCase());

    return matchesCategory && matchesPrice && matchesLocation && matchesAvailability;
  });

  const sortedServices = [...filteredServices].sort((a, b) => {
    if (sortBy === 'Highest Rated') return b.rating - a.rating;
    if (sortBy === 'Nearest First') return parseFloat(a.distance) - parseFloat(b.distance);
    return 0; 
  });

  // ================= 5. HANDLERS =================
  const toggleSection = (section) => setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  const handleCategoryToggle = (category) => { setSelectedCategories(prev => prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]); setCurrentPage(1); };
  const handlePriceToggle = (priceRange) => { setSelectedPrices(prev => prev.includes(priceRange) ? prev.filter(p => p !== priceRange) : [...prev, priceRange]); setCurrentPage(1); };
  const handleAvailabilityToggle = (status) => { setSelectedAvailability(prev => prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]); setCurrentPage(1); };

  const handleClearAll = () => { setSelectedCategories([]); setSelectedPrices([]); setSelectedAvailability([]); setLocationFilter(''); setSortBy('Recommended'); setCurrentPage(1); setIsOthersOpen(false); };
  const handleLocationEnter = (e) => { if (e.key === 'Enter') { e.preventDefault(); setCurrentPage(1); e.target.blur(); } };
  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
  const handleDropdownChange = (e) => setCurrentPage(Number(e.target.value));

  const totalPages = Math.max(1, Math.ceil(sortedServices.length / itemsPerPage));
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentServices = sortedServices.slice(indexOfFirstItem, indexOfLastItem);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) pages.push(1, 2, 3, 4, '...', totalPages);
      else if (currentPage >= totalPages - 2) pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      else pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
    return pages;
  };

  return (
    <div 
      className="relative w-full min-h-screen font-sans bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('/customer-bg.jpg')" }}
    >
      {/* 🔥 PERFECT BLUR & OPACITY BALANCE 🔥 */}
      {/* bg-slate-50/75: 75% opacity rakhi hai taaki piche ka image slightly dikhe */}
      {/* backdrop-blur-[12px]: Blur thoda badhaya hai jisse text ekdam clean padhne me aaye */}
      <div className="absolute inset-0 bg-slate-50/75 backdrop-blur-[12px] z-0"></div>

      <div className="relative z-10 max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        {/* Top Search Bar */}
        <div className="bg-white/95 backdrop-blur-md p-2 rounded-xl shadow-sm border border-slate-200/60 flex flex-col md:flex-row items-center gap-2 mb-8 focus-within:shadow-md transition-shadow duration-300">
          <div className="flex-1 flex items-center px-4 py-2 w-full">
            <span className="text-slate-400 mr-3 text-lg">🔍</span>
            <input type="text" placeholder="Search for services or businesses..." className="w-full outline-none text-slate-700 bg-transparent text-sm" />
          </div>
          <div className="hidden md:block w-px h-8 bg-slate-200"></div>
          <div className="flex-1 flex items-center px-4 py-2 w-full">
            <span className="text-slate-400 mr-3 text-lg">📍</span>
            <input 
              type="text" 
              placeholder="Type Location (e.g., Miami, Chicago...)" 
              value={locationFilter}
              onChange={(e) => { setLocationFilter(e.target.value); setCurrentPage(1); }}
              onKeyDown={handleLocationEnter}
              className="w-full outline-none text-slate-700 bg-transparent text-sm" 
            />
          </div>
          <button className="bg-blue-600 text-white px-8 py-2.5 rounded-lg font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all w-full md:w-auto text-sm shadow-sm hover:shadow">
            Search
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* ================= SIDEBAR ================= */}
          <div className="w-full lg:w-64 shrink-0">
            <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-sm border border-slate-200/60 p-5 sticky top-28 transition-all duration-300">
              
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-900 text-sm tracking-tight">Filter Results</h3>
                <button onClick={handleClearAll} className="text-blue-600 text-xs font-bold px-2 py-1 rounded-md bg-blue-50/0 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 active:scale-95" title="Or press Backspace/Delete">
                  Clear All
                </button>
              </div>

              {/* 1. Categories */}
              <div className="mb-2">
                <div className="flex items-center justify-between mb-4 cursor-pointer group" onClick={() => toggleSection('categories')}>
                  <h4 className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors duration-200">Categories</h4>
                  <svg className={`w-4 h-4 text-slate-400 group-hover:text-blue-500 transform transition-transform duration-300 ${openSections.categories ? 'rotate-180' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
                {openSections.categories && (
                  <div className="flex flex-col gap-2.5 mb-4 transition-all duration-300">
                    {mainCategories.map((cat, i) => (
                      <label key={i} className="flex items-center gap-3 cursor-pointer group/item select-none">
                        <input type="checkbox" checked={selectedCategories.includes(cat)} onChange={() => handleCategoryToggle(cat)} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer transition-colors duration-150" />
                        <span className="text-sm text-slate-600 group-hover/item:text-slate-900 group-hover/item:pl-1 transition-all duration-200">{cat}</span>
                      </label>
                    ))}
                    <div className="mt-1">
                      <div className="flex items-center justify-between cursor-pointer group/other py-1" onClick={() => setIsOthersOpen(!isOthersOpen)}>
                        <span className="text-sm font-semibold text-slate-700 group-hover:text-blue-600 transition-colors duration-200">Other Services</span>
                        <svg className={`w-4 h-4 text-slate-400 group-hover/other:text-blue-500 transform transition-transform duration-300 ${isOthersOpen ? 'rotate-0' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                      {isOthersOpen && (
                        <div className="flex flex-col gap-2.5 mt-2.5 pl-3.5 border-l-2 border-slate-100 focus-within:border-blue-400 transition-all duration-300">
                          {otherCategories.map((cat, i) => (
                            <label key={i} className="flex items-center gap-3 cursor-pointer group/sub select-none">
                              <input type="checkbox" checked={selectedCategories.includes(cat)} onChange={() => handleCategoryToggle(cat)} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                              <span className="text-sm text-slate-600 group-hover/sub:text-slate-900 group-hover/sub:pl-1 transition-all duration-200">{cat}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <hr className="border-slate-100/80 my-4" />

              {/* 2. Location */}
              <div className="mb-2">
                <div className="flex items-center justify-between mb-4 cursor-pointer group" onClick={() => toggleSection('location')}>
                  <h4 className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors duration-200">Location</h4>
                  <svg className={`w-4 h-4 text-slate-400 group-hover:text-blue-500 transform transition-transform duration-300 ${openSections.location ? 'rotate-180' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
                {openSections.location && (
                  <div className="flex items-center border border-slate-200 rounded-lg p-1 bg-slate-50/50 hover:bg-white focus-within:bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all duration-200 mb-4 shadow-inner focus-within:shadow-none">
                     <span className="text-slate-400 text-sm ml-2">📍</span>
                     <input type="text" placeholder="Enter location..." value={locationFilter} onChange={(e) => { setLocationFilter(e.target.value); setCurrentPage(1); }} onKeyDown={handleLocationEnter} className="w-full bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400 px-2 py-0.5" />
                     <button onClick={() => setCurrentPage(1)} className="bg-white hover:bg-blue-600 hover:text-white text-blue-600 p-1.5 rounded-md transition-all duration-200 shadow-sm border border-slate-100 active:scale-90">🔍</button>
                  </div>
                )}
              </div>
              <hr className="border-slate-100/80 my-4" />

              {/* 3. Sort By */}
              <div className="mb-2">
                <div className="flex items-center justify-between mb-4 cursor-pointer group" onClick={() => toggleSection('sortBy')}>
                  <h4 className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors duration-200">Sort By</h4>
                  <svg className={`w-4 h-4 text-slate-400 group-hover:text-blue-500 transform transition-transform duration-300 ${openSections.sortBy ? 'rotate-180' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
                {openSections.sortBy && (
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 bg-white cursor-pointer mb-4 transition-all duration-200">
                    <option value="Recommended">Recommended</option>
                    <option value="Nearest First">Nearest First</option>
                    <option value="Highest Rated">Highest Rated</option>
                  </select>
                )}
              </div>
              <hr className="border-slate-100/80 my-4" />

              {/* 4. Availability */}
              <div className="mb-2">
                <div className="flex items-center justify-between mb-4 cursor-pointer group" onClick={() => toggleSection('availability')}>
                  <h4 className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors duration-200">Availability</h4>
                  <svg className={`w-4 h-4 text-slate-400 group-hover:text-blue-500 transform transition-transform duration-300 ${openSections.availability ? 'rotate-180' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
                {openSections.availability && (
                  <div className="flex flex-col gap-2.5 mb-4">
                    {availabilityOptions.map((status, i) => (
                      <label key={i} className="flex items-center gap-3 cursor-pointer group/avail select-none">
                        <input type="checkbox" checked={selectedAvailability.includes(status)} onChange={() => handleAvailabilityToggle(status)} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                        <span className="text-sm text-slate-600 group-hover/avail:text-slate-900 group-hover/avail:pl-1 transition-all duration-200">{status}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <hr className="border-slate-100/80 my-4" />

              {/* 5. Price Ranges */}
              <div>
                <div className="flex items-center justify-between mb-4 cursor-pointer group" onClick={() => toggleSection('price')}>
                  <h4 className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors duration-200">Price Range</h4>
                  <svg className={`w-4 h-4 text-slate-400 group-hover:text-blue-500 transform transition-transform duration-300 ${openSections.price ? 'rotate-180' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
                {openSections.price && (
                  <div className="flex flex-col gap-2.5">
                    {['Under $20', '$20 - $50', '$50 - $100', 'Above $100'].map((price, i) => (
                      <label key={i} className="flex items-center gap-3 cursor-pointer group/price select-none">
                        <input type="checkbox" checked={selectedPrices.includes(price)} onChange={() => handlePriceToggle(price)} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                        <span className="text-sm text-slate-600 group-hover/price:text-slate-900 group-hover/price:pl-1 transition-all duration-200">{price}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* ================= MAIN CONTENT LISTINGS ================= */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-slate-900">All Services</h2>
                <span className="bg-blue-50/80 text-blue-600 text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm transition-all">{sortedServices.length} Results</span>
              </div>
              <button className="flex items-center gap-2 text-blue-600 text-sm font-medium border border-blue-200 bg-white/95 backdrop-blur-md px-4 py-2 rounded-lg hover:bg-blue-50 active:scale-95 transition-all shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
                Map View
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {currentServices.length > 0 ? currentServices.map((service) => (
                <div key={service.id} className="bg-white/95 backdrop-blur-md rounded-xl shadow-sm border border-slate-200/60 p-4 sm:p-5 flex flex-col md:flex-row gap-5 hover:shadow-lg hover:border-blue-200 transition-all duration-300">
                  
                  <div className="w-full md:w-48 h-40 bg-slate-50 rounded-lg shrink-0 relative flex items-center justify-center border border-slate-100">
                    <span className="text-4xl opacity-80">{service.icon}</span>
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-slate-900">{service.name}</h3>
                        {service.verified && <span className="bg-green-50 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide border border-green-100">Verified</span>}
                      </div>
                      <p className="text-sm text-slate-500 mb-2">{service.category}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
                        <div className="flex items-center gap-1"><span className="text-yellow-400">⭐</span><span className="font-bold text-slate-800">{service.rating}</span></div>
                        <div className="flex items-center gap-1"><span className="text-slate-400">📍</span><span>{service.distance} ({service.location})</span></div>
                      </div>

                      <p className="text-sm text-slate-600 mb-4 line-clamp-2">{service.desc}</p>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-auto">
                      {service.tags.map((tag, idx) => (
                        <span key={idx} className="bg-slate-50 text-slate-600 text-xs font-medium px-2.5 py-1 rounded-md border border-slate-200">{tag}</span>
                      ))}
                    </div>
                  </div>

                  <div className="w-full md:w-48 flex flex-col items-start md:items-end justify-between border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-5 mt-2 md:mt-0">
                    <div className="w-full flex justify-between md:justify-end items-start mb-4">
                       <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                         service.availabilityStatus === 'Available Now' ? 'bg-green-50 text-green-700 border-green-100' : 
                         service.availabilityStatus === 'Available Today' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                         service.availabilityStatus === 'Join Queue' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                         'bg-slate-100 text-slate-600 border-slate-200'
                       }`}>
                         {service.availabilityStatus}
                       </span>
                    </div>
                    
                    <div className="w-full flex flex-row md:flex-col justify-between md:items-end gap-2 mb-4">
                      <div className="text-left md:text-right">
                        <p className="text-xs text-slate-500 mb-0.5">Next Available</p>
                        <p className="text-sm font-semibold text-slate-800">{service.nextAvailable}</p>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="text-sm font-bold text-slate-900">{service.price}</p>
                      </div>
                    </div>

                    <button disabled={service.availabilityStatus === 'Fully Booked'} className={`w-full font-semibold py-2.5 rounded-lg transition-all duration-200 text-sm shadow-sm ${service.availabilityStatus === 'Fully Booked' ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98] hover:shadow-md hover:shadow-blue-200'}`}>
                      {service.availabilityStatus === 'Join Queue' ? 'Join Queue' : service.availabilityStatus === 'Fully Booked' ? 'Unavailable' : 'Book Now'}
                    </button>
                  </div>

                </div>
              )) : (
                <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-sm border border-slate-200 p-10 text-center flex flex-col items-center justify-center animate-fade-in">
                   <span className="text-4xl mb-4">🔮</span>
                   <h3 className="text-lg font-bold text-slate-900 mb-2">No Mathematical Match Found</h3>
                   <p className="text-sm text-slate-500 mb-4">This specific combination of filters has 0 intersections in our dataset.</p>
                   <button onClick={handleClearAll} className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm shadow-sm">
                     Reset All Filters
                   </button>
                </div>
              )}
            </div>

            {/* PAGINATION PANEL */}
            {sortedServices.length > 0 && (
              <div className="flex flex-col md:flex-row items-center justify-between border-t border-slate-200/60 mt-10 pt-6 gap-6 bg-white/50 p-4 rounded-xl backdrop-blur-sm">
                <div className="text-sm text-slate-500 font-medium">
                  Showing <span className="font-bold text-slate-900">{indexOfFirstItem + 1}</span> to <span className="font-bold text-slate-900">{Math.min(indexOfLastItem, sortedServices.length)}</span> of <span className="font-bold text-slate-900">{sortedServices.length}</span> results
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <button onClick={handlePrevPage} disabled={currentPage === 1} className={`w-8 h-8 flex items-center justify-center rounded-lg border text-sm font-medium transition-colors bg-white/95 ${currentPage === 1 ? 'border-slate-100 text-slate-300 cursor-not-allowed' : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 shadow-sm'}`}>{"<"}</button>
                    
                    {getPageNumbers().map((page, index) => (
                      <button 
                        key={index}
                        onClick={() => typeof page === 'number' && setCurrentPage(page)}
                        disabled={page === '...'}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg border text-sm font-semibold transition-all bg-white/95 shadow-sm ${page === '...' ? 'border-transparent text-slate-400 cursor-default shadow-none' : currentPage === page ? 'bg-blue-600 border-blue-600 text-white shadow-md scale-105' : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600'}`}
                      >
                        {page}
                      </button>
                    ))}

                    <button onClick={handleNextPage} disabled={currentPage === totalPages} className={`w-8 h-8 flex items-center justify-center rounded-lg border text-sm font-medium transition-colors bg-white/95 ${currentPage === totalPages ? 'border-slate-100 text-slate-300 cursor-not-allowed' : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 shadow-sm'}`}>{">"}</button>
                  </div>
                  
                  <div className="flex items-center gap-2 pl-0 sm:pl-4 sm:border-l border-slate-300">
                    <span className="text-sm text-slate-500 font-medium">Go to:</span>
                    <select 
                      value={currentPage} 
                      onChange={handleDropdownChange}
                      className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 cursor-pointer bg-white/95 shadow-sm"
                    >
                      {[...Array(totalPages)].map((_, idx) => (
                        <option key={idx + 1} value={idx + 1}>Page {idx + 1}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerPage;