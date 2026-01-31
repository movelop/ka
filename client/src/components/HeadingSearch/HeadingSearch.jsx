import React, { useState, useContext, useEffect } from "react";
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

  /* Sync local state with context */
  useEffect(() => {
    setSearchDates(dates);
  }, [dates]);

  useEffect(() => {
    setSearchOptions(options);
  }, [options]);

  /* Date handler */
  const handleDateRangeChange = (item) => {
    setSearchDates([item.selection]);
  };

  /* Options handler */
  const handleSearchOptions = (name, type) => {
    setSearchOptions((prev) => ({
      ...prev,
      [name]: type === "increment" ? prev[name] + 1 : prev[name] - 1,
    }));
  };

  const handleSearch = () => {
    if (location.pathname !== "/booking") {
      navigate("/booking");
    }
    search(searchDates, searchOptions);
  };

  return (
    <div className="headerSearchContainer">
      {/* DATE */}
      <div className="headerSearchItem">
        <BsFillCalendar2EventFill className="headerIcon" />
        <span
          className="headerSearchText"
          onClick={() => setOpenDate(!openDate)}
        >
          {`${format(new Date(searchDates[0].startDate), "dd/MM/yyyy")} to ${format(
            new Date(searchDates[0].endDate),
            "dd/MM/yyyy"
          )}`}
        </span>
        {openDate && (
          <div className="date" onMouseLeave={() => setOpenDate(false)}>
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

      {/* OPTIONS */}
      <div className="headerSearchItem">
        <BsFillPersonFill className="headerIcon" />
        <span
          className="headerSearchText"
          onClick={() => setOpenOptions(!openOptions)}
        >
          {`${searchOptions.adults} adult · ${searchOptions.children} children · ${searchOptions.rooms} room`}
        </span>
        {openOptions && (
          <div className="searchOptions" onMouseLeave={() => setOpenOptions(false)}>
            {/* ADULT */}
            <div className="optionItem">
              <span>Adult</span>
              <div className="optionCounter">
                <button
                  disabled={searchOptions.adults <= 1}
                  onClick={() => handleSearchOptions("adults", "decrement")}
                >
                  -
                </button>
                <span>{searchOptions.adults}</span>
                <button onClick={() => handleSearchOptions("adults", "increment")}>+</button>
              </div>
            </div>

            {/* CHILDREN */}
            <div className="optionItem">
              <span>Children</span>
              <div className="optionCounter">
                <button
                  disabled={searchOptions.children <= 0}
                  onClick={() => handleSearchOptions("children", "decrement")}
                >
                  -
                </button>
                <span>{searchOptions.children}</span>
                <button onClick={() => handleSearchOptions("children", "increment")}>+</button>
              </div>
            </div>

            {/* ROOMS */}
            <div className="optionItem">
              <span>Room</span>
              <div className="optionCounter">
                <button
                  disabled={searchOptions.rooms <= 1}
                  onClick={() => handleSearchOptions("rooms", "decrement")}
                >
                  -
                </button>
                <span>{searchOptions.rooms}</span>
                <button onClick={() => handleSearchOptions("rooms", "increment")}>+</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SEARCH BUTTON */}
      <div className="headerSearchCTA">
        <button className="headingButton" onClick={handleSearch}>
          Check Availability
        </button>
      </div>
    </div>
  );
};

export default HeadingSearch;
