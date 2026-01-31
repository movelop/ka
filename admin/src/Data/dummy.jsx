import React from 'react';
import { BsFillCreditCardFill } from 'react-icons/bs'
import { FiBarChart, FiUsers } from 'react-icons/fi';
import { FaHotel } from 'react-icons/fa';
import { MdBedroomParent, MdDashboard, MdOutlineSupervisorAccount } from 'react-icons/md';

export const links = [
  {
    title: 'Dashboard',
    links: [
      {
        name: 'dashboard',
        icon: <MdDashboard />,
      },
    ],
  },

  {
    title: 'Pages',
    links: [
      {
        name: 'users',
        icon: <FiUsers />,
      },
      {
        name: 'facilities',
        icon: <FaHotel />,
      },
      {
        name: 'rooms',
        icon: <MdBedroomParent />,
      },
      {
          name: 'bookings',
          icon: <BsFillCreditCardFill />
      },
    ],
  },
];  

export const themeColors = [
  {
    name: 'blue-theme',
    color: '#1A97F5',
  },
  {
    name: 'green-theme',
    color: '#03C9D7',
  },
  {
    name: 'purple-theme',
    color: '#7352FF',
  },
  {
    name: 'red-theme',
    color: '#FF5C8E',
  },
  {
    name: 'indigo-theme',
    color: '#1E4DB7',
  },
  {
    color: '#FB9678',
    name: 'orange-theme',
  },
];

export const earningData = [
  {
    icon: <MdOutlineSupervisorAccount />,
    amount: '1,354',
    percentage: '-4%',
    title: 'Customers',
    iconColor: '#03C9D7',
    iconBg: '#E5FAFB',
    pcColor: 'red-600',
  },
  {
    icon: <FiBarChart />,
    amount: '2,339',
    percentage: '+38%',
    title: 'Bookings',
    iconColor: 'rgb(228, 106, 118)',
    iconBg: 'rgb(255, 244, 229)',

    pcColor: 'green-600',
  },
];

export const dropdownData = [
  {
    Id: '1',
    Time: 'March 2021',
  },
  {
    Id: '2',
    Time: 'April 2021',
  }, {
    Id: '3',
    Time: 'May 2021',
  },
];

export const tableData = [
  {
    id: 1143155,
    product: "Acer Nitro 5",
    img: "https://m.media-amazon.com/images/I/81bc8mA3nKL._AC_UY327_FMwebp_QL65_.jpg",
    customer: "John Smith",
    date: "1 March",
    amount: 785,
    method: "Cash on Delivery",
    status: "Approved",
  },
  {
    id: 2235235,
    product: "Playstation 5",
    img: "https://m.media-amazon.com/images/I/31JaiPXYI8L._AC_UY327_FMwebp_QL65_.jpg",
    customer: "Michael Doe",
    date: "1 March",
    amount: 900,
    method: "Online Payment",
    status: "Pending",
  },
  {
    id: 2342353,
    product: "Redragon S101",
    img: "https://m.media-amazon.com/images/I/71kr3WAj1FL._AC_UY327_FMwebp_QL65_.jpg",
    customer: "John Smith",
    date: "1 March",
    amount: 35,
    method: "Cash on Delivery",
    status: "Pending",
  },
  {
    id: 2357741,
    product: "Razer Blade 15",
    img: "https://m.media-amazon.com/images/I/71wF7YDIQkL._AC_UY327_FMwebp_QL65_.jpg",
    customer: "Jane Smith",
    date: "1 March",
    amount: 920,
    method: "Online",
    status: "Approved",
  },
  {
    id: 2342355,
    product: "ASUS ROG Strix",
    img: "https://m.media-amazon.com/images/I/81hH5vK-MCL._AC_UY327_FMwebp_QL65_.jpg",
    customer: "Harold Carol",
    date: "1 March",
    amount: 2000,
    method: "Online",
    status: "Pending",
  },
];

export const pieChartData = [
  { name: "Group A", value: 400 },
  { name: "Group B", value: 300 },
  { name: "Group C", value: 300 },
  { name: "Group D", value: 200 }
];

export const chartData = [
  {
    name: "2006",
    uv: 4000,
    pv: 2400,
    amt: 2400
  },
  {
    name: "2007",
    uv: 3000,
    pv: 1398,
    amt: 2210
  },
  {
    name: "2008",
    uv: 2000,
    pv: 9800,
    amt: 2290
  },
  {
    name: "2009",
    uv: 2780,
    pv: 3908,
    amt: 2000
  },
  {
    name: "2010",
    uv: 1890,
    pv: 4800,
    amt: 2181
  },
  {
    name: "2011",
    uv: 2390,
    pv: 3800,
    amt: 2500
  },
  {
    name: "2012",
    uv: 3490,
    pv: 4300,
    amt: 2100
  }
];