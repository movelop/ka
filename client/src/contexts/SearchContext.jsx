import { createContext, useReducer, useEffect } from "react";

const storedDates = localStorage.getItem("dates");
const parsedDates = storedDates ? JSON.parse(storedDates) : null;

const storedOptions = localStorage.getItem("options");
const parsedOptions = storedOptions ? JSON.parse(storedOptions) : null;

const today = new Date();
const tomorrow = new Date(today.getTime() + 86400000);

const INITIAL_STATE = {
  dates: [
    {
      startDate:
        parsedDates && new Date(parsedDates[0]?.startDate) > today
          ? new Date(parsedDates[0].startDate)
          : today,
      endDate:
        parsedDates && new Date(parsedDates[0]?.endDate) > today
          ? new Date(parsedDates[0].endDate)
          : tomorrow,
      key: "selection",
    },
  ],
  options: parsedOptions || {
    adults: 1,
    children: 0,
    rooms: 1,
  },
};

export const SearchContext = createContext(INITIAL_STATE);

const searchReducer = (state, action) => {
  switch (action.type) {
    case "NEW_SEARCH":
      return {
        ...state,
        ...action.payload,
      };

    case "RESET_SEARCH":
      return INITIAL_STATE;

    default:
      return state;
  }
};

export const SearchContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(searchReducer, INITIAL_STATE);

  useEffect(() => {
    localStorage.setItem("dates", JSON.stringify(state.dates));
  }, [state.dates]);

  useEffect(() => {
    localStorage.setItem("options", JSON.stringify(state.options));
  }, [state.options]);

  const search = (dates, options) => {
    dispatch({
      type: "NEW_SEARCH",
      payload: { dates, options },
    });
  };

  return (
    <SearchContext.Provider
      value={{
        dates: state.dates,
        options: state.options,
        search,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};
