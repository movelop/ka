import React, { useState, useContext, useEffect, useRef } from "react";
import { BsFillCalendar2EventFill, BsFillPersonFill } from "react-icons/bs";
import { useNavigate, useLocation } from "react-router-dom";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { format } from "date-fns";

import { SearchContext } from "../../contexts/SearchContext";
import "./HeadingSearch.css";

const HeadingSearch = () => {
  const { search, dates, options } = useContext(SearchContext);

  const [openDate, setOpenDate] = useState(false);
  const [openOptions, setOpenOptions] = useState(false);

  const [searchDates, setSearchDates] = useState(dates);
  const [searchOptions, setSearchOptions] = useState(options);

  const navigate = useNavigate();
  const location = useLocation();

  const dateRef = useRef(null);
  const optionsRef = useRef(null);

  /* Sync local state with context */
  useEffect(() => { setSearchDates(dates); }, [dates]);
  useEffect(() => { setSearchOptions(options); }, [options]);

  /* Close dropdowns on outside click */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dateRef.current && !dateRef.current.contains(e.target)) {
        setOpenDate(false);
      }
      if (optionsRef.current && !optionsRef.current.contains(e.target)) {
        setOpenOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDateRangeChange = (item) => {
    setSearchDates([item.selection]);
    const { startDate, endDate } = item.selection;
    if (startDate && endDate && startDate.getTime() !== endDate.getTime()) {
      setOpenDate(false);
    }
  };

  const handleSearchOptions = (name, type) => {
    setSearchOptions((prev) => ({
      ...prev,
      [name]: type === "increment" ? prev[name] + 1 : prev[name] - 1,
    }));
  };

  const handleSearch = () => {
    if (location.pathname !== "/booking") navigate("/booking");
    search(searchDates, searchOptions);
  };

  return (
    <div className="headerSearchContainer">

      {/* ── DATE ── */}
      <div
        className="headerSearchItem"
        ref={dateRef}
        onClick={() => { setOpenDate(!openDate); setOpenOptions(false); }}
      >
        <BsFillCalendar2EventFill className="headerIcon" />
        <div className="headerSearchItem__inner">
          <span className="headerSearchItem__label">Check-in / Check-out</span>
          <span className="headerSearchText">
            {`${format(new Date(searchDates[0].startDate), "dd MMM yyyy")}  →  ${format(
              new Date(searchDates[0].endDate),
              "dd MMM yyyy"
            )}`}
          </span>
        </div>

        {openDate && (
          <div className="date" onClick={(e) => e.stopPropagation()}>
            <DateRange
              editableDateInputs
              onChange={handleDateRangeChange}
              moveRangeOnFirstSelection={false}
              ranges={searchDates}
              minDate={new Date()}
            />
          </div>
        )}
      </div>

      {/* ── GUESTS / ROOMS ── */}
      <div
        className="headerSearchItem"
        ref={optionsRef}
        onClick={() => { setOpenOptions((p) => !p); setOpenDate(false); }}
      >
        <BsFillPersonFill className="headerIcon" />
        <div className="headerSearchItem__inner">
          <span className="headerSearchItem__label">Guests &amp; Rooms</span>
          <span className="headerSearchText">
            {`${searchOptions.adults} adult · ${searchOptions.children} children · ${searchOptions.rooms} room`}
          </span>
        </div>

        {openOptions && (
          <div className="searchOptions" onClick={(e) => e.stopPropagation()}>

            {[
              { key: "adults",   label: "Adults",   min: 1 },
              { key: "children", label: "Children", min: 0 },
              { key: "rooms",    label: "Rooms",    min: 1 },
            ].map(({ key, label, min }) => (
              <div className="optionItem" key={key}>
                <span>{label}</span>
                <div className="optionCounter">
                  <button
                    disabled={searchOptions[key] <= min}
                    onClick={(e) => { e.stopPropagation(); handleSearchOptions(key, "decrement"); }}
                  >
                    −
                  </button>
                  <span>{searchOptions[key]}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleSearchOptions(key, "increment"); }}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}

          </div>
        )}
      </div>

      {/* ── CTA ── */}
      <div className="headerSearchCTA">
        <button className="headingButton" onClick={handleSearch}>
          <span>Check Availability</span>
        </button>
      </div>

    </div>
  );
};

export default HeadingSearch;