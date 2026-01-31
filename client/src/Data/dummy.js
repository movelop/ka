import homeImage from '../assets/Assets/home.jpg';
import facilitiesImg from '../assets/Assets/facilities.jpg';
import exploreRooms from '../assets/Assets/explorerooms.jpg';                                  
import explore2 from '../assets/Assets/explore2.jpg';    
import queen from '../assets/Assets/queen.jpg';  
import nopage from '../assets/Assets/404.jpg';
import lobby from '../assets/Assets/lobby.jpg'; 
import existing from '../assets//Assets/existing.jpg';         
import checkout from '../assets//Assets/checkout.jpg';         
import confirm from '../assets//Assets/confirm.jpg';  
import room from '../assets//Assets/room.jpg';     
import logo from '../assets//Assets/logo.png';   

export const navData = [
    {
        name: 'Facilities',
        link: 'facilities',
    },
    {
        name: 'Rooms',
        link: 'rooms',
    },
    {
        name: 'Contact-us',
        link: 'contact',
    }
];

export const images = {
    homeImage,
    facilitiesImg,
    exploreRooms,
    explore2,
    queen,
    nopage,
    lobby,
    existing,
    checkout,
    confirm,
    room,
    logo,
};

export const testimonials = [
    {
        name: 'Fidelis',
        title: 'exotic place',
        testimony: 'Excellent hotel of this class…newer property and kept extremely clean. Front desk staff is very friendly and welcoming. Breakfast area is spacious and one of the best in Ogun State I have experienced. Parking is adequate with some overflow in the back, lower lot. I’ll be back to this place and highly recommend to others when in the area.'
    },
    {
        name: 'Nebs',
        title: 'A good hotel with clean rooms',
        testimony: 'A good hotel with clean rooms and attractive staff, so attractive in fact the room service was a little more than myself and my husband expected! But we have no complaints and we look forward to being there again soon.'
    },
    {
        name: 'Alhaja',
        title: 'A truly outstanding experience!',
        testimony: `A truly outstanding experience! My husband and I had a fabulous 5 nights staying at D'Czars Hotel, I cannot recommend this hotel enough! And the hotels.ng website is just great, so easy to use! If I were to recommend a hotel website for anyone it’d be this one!`
    },
];

export const facilities = [
    {
        title: 'Accommodation',
        img: room,
    },
    {
        title: 'Bar',
        img: facilitiesImg,
    },
    {
        title: 'Internet Service',
        img: lobby,
    },
    {
        title: 'Restaurant',
        img: checkout,
    }
];

export const rooms = [
    {
        _id: '001',
        title: 'Majesty',
        price: 20000,
        images: [
            "http://res.cloudinary.com/dmxz3k6o4/image/upload/v1669125454/dczar/eb53ryvrtognd23zgdiy.webp",
            "http://res.cloudinary.com/dmxz3k6o4/image/upload/v1669125454/dczar/pzkqtn0i7z4rfzcqoahr.jpg",
            "http://res.cloudinary.com/dmxz3k6o4/image/upload/v1669125454/dczar/cofwtvw9yts5odg7soh5.jpg",
            "http://res.cloudinary.com/dmxz3k6o4/image/upload/v1669125455/dczar/ckbpbnxwatdzdouqwf5x.jpg",
            "http://res.cloudinary.com/dmxz3k6o4/image/upload/v1669125454/dczar/wd38v8zxeyogvfcayfgj.jpg",
            "http://res.cloudinary.com/dmxz3k6o4/image/upload/v1669125459/dczar/n8zjeh8c9xaivkhvhgw4.webp"
        ],
        maxPeople: '2',
        size: '30sqm',
        bedding: '1 Double Bed',
        desc: "The rooms at K.A Hotel are quite spacious and come with great services and facilities such as luxurious beds, wardrobe, flat-screen television sets with access to cable channels, free wireless internet access, en-suite bathrooms with stand-in showers and complimentary toiletries, telephone luggage storage, tables and armchairs, refrigerators plus in-room sofas.",
        roomNumbers: [
            {
                number: '301',
                unavailableDates: []
            },
            {
                number: '302',
                unavailableDates: []
            },
            {
                number: '304',
                unavailableDates: []
            },
            {
                number: '305',
                unavailableDates: []
            }
        ]
    },
    {
        _id: '002',
        title: 'Duke',
        price: 40000,
        images: [
            "http://res.cloudinary.com/dmxz3k6o4/image/upload/v1669125454/dczar/eb53ryvrtognd23zgdiy.webp",
            "http://res.cloudinary.com/dmxz3k6o4/image/upload/v1669125454/dczar/pzkqtn0i7z4rfzcqoahr.jpg",
            "http://res.cloudinary.com/dmxz3k6o4/image/upload/v1669125454/dczar/cofwtvw9yts5odg7soh5.jpg",
            "http://res.cloudinary.com/dmxz3k6o4/image/upload/v1669125455/dczar/ckbpbnxwatdzdouqwf5x.jpg",
            "http://res.cloudinary.com/dmxz3k6o4/image/upload/v1669125454/dczar/wd38v8zxeyogvfcayfgj.jpg",
            "http://res.cloudinary.com/dmxz3k6o4/image/upload/v1669125459/dczar/n8zjeh8c9xaivkhvhgw4.webp"
        ],
        maxPeople: '2',
        size: '35sqm',
        bedding: '1 Double Bed',
        desc: "The rooms at K.A Hotel are quite spacious and come with great services and facilities such as luxurious beds, wardrobe, flat-screen television sets with access to cable channels, free wireless internet access, en-suite bathrooms with stand-in showers and complimentary toiletries, telephone luggage storage, tables and armchairs, refrigerators plus in-room sofas.",
        roomNumbers: [
            {
                number: '201',
                unavailableDates: []
            },
            {
                number: '202',
                unavailableDates: []
            },
            {
                number: '204',
                unavailableDates: []
            },
            {
                number: '205',
                unavailableDates: []
            }
        ]
    },
    {
        _id: '003',
        title: 'Emperor Suite',
        price: 60000,
        images: [
            "http://res.cloudinary.com/dmxz3k6o4/image/upload/v1669125454/dczar/eb53ryvrtognd23zgdiy.webp",
            "http://res.cloudinary.com/dmxz3k6o4/image/upload/v1669125454/dczar/pzkqtn0i7z4rfzcqoahr.jpg",
            "http://res.cloudinary.com/dmxz3k6o4/image/upload/v1669125454/dczar/cofwtvw9yts5odg7soh5.jpg",
            "http://res.cloudinary.com/dmxz3k6o4/image/upload/v1669125455/dczar/ckbpbnxwatdzdouqwf5x.jpg",
            "http://res.cloudinary.com/dmxz3k6o4/image/upload/v1669125454/dczar/wd38v8zxeyogvfcayfgj.jpg",
            "http://res.cloudinary.com/dmxz3k6o4/image/upload/v1669125459/dczar/n8zjeh8c9xaivkhvhgw4.webp"
        ],
        maxPeople: '4',
        size: '75sqm',
        bedding: '1 King Bed',
        desc: "The rooms at K.A Hotel are quite spacious and come with great services and facilities such as luxurious beds, wardrobe, flat-screen television sets with access to cable channels, free wireless internet access, en-suite bathrooms with stand-in showers and complimentary toiletries, telephone luggage storage, tables and armchairs, refrigerators plus in-room sofas.",
        roomNumbers: [
            {
                number: '101',
                unavailableDates: []
            },
            {
                number: '102',
                unavailableDates: []
            },
        ]
    },
]

export const bookings = [
        {
    "_id": {
        "$oid": "63a2ef01fb5eaabb6148f864"
    },
    "firstname": "Grace",
    "lastname": "Ajoke ",
    "email": "dczarshotel@yahoo.com",
    "phone": "08060593540",
    "roomTitle": "Majesty",
    "adults": 1,
    "children": 0,
    "startDate": {
        "$date": "2022-12-20T23:00:00.000Z"
    },
    "endDate": {
        "$date": "2022-12-21T23:00:00.000Z"
    },
    "numberOfRooms": 1,
    "selectedRooms": [
        "63720f41359024395fa8db02"
    ],
    "roomNumbers": [
        305
    ],
    "price": 13500,
    "confirmation": "OJGD3OVELVR1",
    "cancelled": false,
    "createdAt": {
        "$date": "2022-12-21T11:33:21.401Z"
    },
    "updatedAt": {
        "$date": "2023-01-03T03:42:59.152Z"
    },
    "__v": 0,
    "checkedIn": true
    },
    {
    "_id": {
        "$oid": "63a2efacfb5eaabb6148f8a8"
    },
    "firstname": "Abiola",
    "lastname": "Abiola",
    "email": "dczarshotel@yahoo.com",
    "phone": "09015117060",
    "roomTitle": "Prince & Princess ",
    "adults": 1,
    "children": 0,
    "startDate": {
        "$date": "2022-12-20T23:00:00.000Z"
    },
    "endDate": {
        "$date": "2022-12-22T23:00:00.000Z"
    },
    "numberOfRooms": 1,
    "selectedRooms": [
        "63720ea7359024395fa8dab2"
    ],
    "roomNumbers": [
        104
    ],
    "price": 20000,
    "confirmation": "FB7ZNRA1ZJ4K",
    "cancelled": false,
    "createdAt": {
        "$date": "2022-12-21T11:36:12.766Z"
    },
    "updatedAt": {
        "$date": "2023-01-03T03:42:37.458Z"
    },
    "__v": 0,
    "checkedIn": true
    },
    {
    "_id": {
        "$oid": "63a2eff8fb5eaabb6148f8c9"
    },
    "firstname": "Ahmed",
    "lastname": "Ahmed",
    "email": "dczarshotel@yahoo.com",
    "phone": "09036472908",
    "roomTitle": "Imperial",
    "adults": 1,
    "children": 0,
    "startDate": {
        "$date": "2022-12-21T11:24:13.853Z"
    },
    "endDate": {
        "$date": "2022-12-22T11:24:13.853Z"
    },
    "numberOfRooms": 1,
    "selectedRooms": [
        "63720f94359024395fa8db27"
    ],
    "roomNumbers": [
        207
    ],
    "price": 15500,
    "confirmation": "EAQS1EU5Q8NX",
    "cancelled": false,
    "createdAt": {
        "$date": "2022-12-21T11:37:28.422Z"
    },
    "updatedAt": {
        "$date": "2023-01-03T03:42:02.068Z"
    },
    "__v": 0,
    "checkedIn": true
    },
]