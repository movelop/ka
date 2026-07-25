export const userColumns = [
  { field: "id", headerName: "ID", width: 70 },
  {
    field: "user",
    headerName: "User",
    width: 230,
    renderCell: (params) => {
      return (
        <div className="flex items-center">
          <img className="w-[32px] h-[32px] rounded-full object-cover mr-[20px]" src={params.row.image || "https://i.ibb.co/MBtjqXQ/no-avatar.gif"} alt="avatar" />
          <span className="capitalize">{params.row.username}</span>
        </div>
      );
    },
  },
  {
    field: "email",
    headerName: "Email",
    width: 230,
  },

  {
    field: "country",
    headerName: "Country",
    width: 100,
  },
  {
    field: "phone",
    headerName: "Phone",
    width: 100,
  },
  {
    field: "isAdmin",
    headerName: "Status",
    width: 160,
    renderCell: (params) => {
      return (
        <div className={`p-[5px] rounded-sm ${params.row.isAdmin? 'bg-[#0080000d] text-green-700' : 'bg-[#0080000d] text-red-700'}`}>
          {params.row.isAdmin ? 'Admin' : 'Customer'}
        </div>
      );
    },
  },
];

export const facilityColumns = [
  { field: "id", headerName: "ID", width: 70 },
  { field: "image",
    headerName: "Image",
    width: 130,
    renderCell: (params) => {
      return (
        <div className="flex items-center">
          <img className="w-[32px] h-[32px] rounded-full object-cover mr-[20px]" src={params.row.image} alt="avatar" />
        </div>
      );
    },
  },
  {
    field: "title",
    headerName: "Facility",
    width: 230,
  },
];

export const roomColumns = [
  { field: "_id", headerName: "ID", width: 70 },
  {
    field: "title",
    headerName: "Room Name",
    width: 230,
    renderCell: (params) => {
      return (
        <div className="flex items-center">
          <img className="w-[32px] h-[32px] rounded-full object-cover mr-[20px]" src={params.row.images ? params.row.images[0] : "https://i.ibb.co/MBtjqXQ/no-avatar.gif"} alt="avatar" />
          <span className="capitalize">{params.row.title}</span>
        </div>
      );
    },
  },
  {
    field: "desc",
    headerName: "Description",
    width: 200,
  },
  {
    field: "price",
    headerName: "Price",
    width: 100,
  },
  {
    field: "maxPeople",
    headerName: "Max People",
    width: 100,
  },
];

// A booking may be in either shape:
//   - OLD (pre-multi-category): flat roomTitle / roomNumbers / price on the booking itself
//   - NEW: `rooms` is an array of room-category line items, each with its
//     own roomTitle/roomNumbers, plus a top-level totalPrice after discount
// These helpers read whichever shape a given row actually has, so the grid
// never crashes on either an old or a new booking record.
const getRoomTitleSummary = (row) => {
  if (Array.isArray(row.rooms) && row.rooms.length) {
    return row.rooms.map((r) => r.roomTitle).join(", ");
  }
  return row.roomTitle || "—";
};

const getRoomNumberSummary = (row) => {
  if (Array.isArray(row.rooms) && row.rooms.length) {
    return row.rooms.flatMap((r) => r.roomNumbers || []);
  }
  return row.roomNumbers || [];
};

const getBookingPrice = (row) => {
  // totalPrice (post-discount) is the new field; price is the old one
  if (typeof row.totalPrice === "number") return row.totalPrice;
  return row.price;
};

// A booking predating the multi-category redesign never has a `rooms`
// array. Mongoose backfills MISSING fields with their schema defaults when
// reading a document — so an old booking's paymentStatus doesn't come back
// as undefined, it comes back as "unpaid" (the schema default), same for
// amountPaid: 0. Checking `!row.paymentStatus` therefore never catches old
// bookings; checking for the absence of `rooms` does, since old documents
// genuinely never had that field written to them.
const isLegacyBooking = (row) => !Array.isArray(row.rooms) || row.rooms.length === 0;

export const bookingColumns = [
  {
    field: "confirmation", headerName: "Confirmation", width: 200,
  },
  {
    field: "lastname", headerName: "Name", width: 130,
    renderCell: (params) => {
      return (
        <div className='flex items-center'>
          <span>{params.row.lastName? params.row.lastName : params.row.firstName}</span>
        </div>
      )
    }
  },
  {
    field: "startDate", headerName: "Check-In", width: 100,
    renderCell: (params) => {
      return (
        <div className="flex items-center"> 
          <span>{new Date(params.row.startDate).toLocaleString('en-uk', {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })}</span>
        </div>
      )
    }
  },
  {
    field: "endDate", headerName: "Check-Out", width: 100,
    renderCell: (params) => {
      return (
        <div className="flex items-center"> 
          <span>{new Date(params.row.endDate).toLocaleString('en-uk', {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })}</span>
        </div>
      )
    }
  },
  {
    field: "phone", headerName: "Phone", width: 150,
  },
  {
    field: "roomTitle", headerName: "Room Title", width: 150,
    renderCell: (params) => {
      return (
        <div className="flex items-center">
          <span className="capitalize">{getRoomTitleSummary(params.row)}</span>
        </div>
      );
    },
  },
  {
    field: 'roomNumbers', headerName: 'Room Numbers', width: 150,
    renderCell: (params) => {
      const numbers = getRoomNumberSummary(params.row);
      return(
        <div className="flex items-center">
          <span className="capitalize">{numbers.length ? numbers.join(", ") : "—"}</span>
        </div>
      )
    }
  },
  {
    field: "price", headerName: "Price", width: 100,
    renderCell: (params) => {
      const price = getBookingPrice(params.row);
      return (
        <div className="flex items-center">
          <span className="capitalize">{price > 0 ? `₦${price.toLocaleString()}` : "Complimentry"}</span>
        </div>
      );
    },
  },
  {
    field: "paymentStatus", headerName: "Payment", width: 130,
    renderCell: (params) => {
      // Old bookings always show as paid — they predate down payments
      // entirely, so there's no real balance to track for them, whatever
      // the (defaulted) paymentStatus value looks like.
      const status = isLegacyBooking(params.row) ? "paid" : params.row.paymentStatus;
      if (!status || status === "paid") {
        return (
          <div className="p-[5px] rounded-sm bg-[#0080000d] text-green-700">
            Paid
          </div>
        );
      }
      const label = status === "partial" ? "Partial" : "Unpaid";
      return (
        <div className={`p-[5px] rounded-sm ${status === "partial" ? "bg-[#ff98000d] text-orange-700" : "bg-[#ff00000d] text-red-700"}`}>
          {label}
        </div>
      );
    },
  },
  {
    field: "registeredBy", headerName: "Channel", width: 200,
    renderCell: (params) => {
      return (
        <div className="flex items-center">
          <span className="capitalize">{params.row.registeredBy ? params.row.registeredBy : "Online"}</span>
        </div>
      );
    },
  },
  {
    field: "paymentReference", headerName: "Payment Reference", width: 180,
    renderCell: (params) => {
      return (
        <div className="flex items-center">
          <span className="capitalize">{params.row.paymentReference || 'Walk-in Customer'}</span>
        </div>
      );
    },
  },
] 


export const customerColumns = [
  { field: "id", headerName: "ID", width: 70 },

  {
    field: "fullName",
    headerName: "Customer",
    width: 230,
    renderCell: (params) => {
      return (
        <div className="flex items-center">
          <img
            className="w-[32px] h-[32px] rounded-full object-cover mr-[20px]"
            src={params.row.image || "https://i.ibb.co/MBtjqXQ/no-avatar.gif"}
            alt="avatar"
          />
          <span className="capitalize">{params.row.fullName}</span>
        </div>
      );
    },
  },

  {
    field: "email",
    headerName: "Email",
    width: 230,
  },

  {
    field: "phone",
    headerName: "Phone",
    width: 150,
  },

  {
    field: "address",
    headerName: "Address",
    width: 300,
  },

  {
    field: "totalBookings",
    headerName: "Bookings",
    width: 120,
  },

  {
    field: "totalSpent",
    headerName: "Total Spent",
    width: 150,
    renderCell: (params) => {
      return (
        <span className="font-medium">
          ₦{params.row.totalSpent?.toLocaleString() || 0}
        </span>
      );
    },
  },

  {
    field: "lastBooking",
    headerName: "Last Booking",
    width: 180,
    renderCell: (params) => {
      return (
        <span>
          {params.row.lastBooking
            ? new Date(params.row.lastBooking).toLocaleDateString("en-GB")
            : "N/A"}
        </span>
      );
    },
  },
];