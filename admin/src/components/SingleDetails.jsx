import React from 'react';

const SingleDetails = ({ type, data, img }) => {
  return (
    <>
      {type === 'user' && (
        <div className='flex flex-col lg:flex-row gap-[30px] lg:gap-[40px]'>
          <img
              src={data.image || "https://i.ibb.co/MBtjqXQ/no-avatar.gif"}
              alt=""
              className="w-full lg:w-[700px] h-[200px] md:h-[350px] lg:h-[500px] rounded-lg object-cover "
          />
          <div>
            <h1 className="mb-[10px] md:text-2xl font-semibold">{`${data.firstName} ${data.lastName}`}</h1>
            <div className="mb-[10px] md:text-lg">
              <span className="font-bold mr-2">Email:</span>
              <span className="font-normal">{data.email}</span>
            </div>
            <div className="mb-[10px] md:text-lg">
              <span className="font-bold text-normal mr-2">Phone:</span>
              <span className="font-normal">{data.phone}</span>
            </div>
            <div className="mb-[10px] md:text-lg">
              <span className="font-bold mr-2">Username:</span>
              <span className="font-normal">{data.username}</span>
            </div>
            <div className="mb-[10px] md:text-lg">
              <span className="font-bold mr-2">Country:</span>
              <span className="font-normal">{data.country}</span>
            </div>
          </div>
        </div>
      )}
      {type === 'facility' && (
        <div className='flex flex-col lg:flex-row items-center gap-[30px] lg:gap-[40px]'>
          <img
            src={data.image || "https://i.ibb.co/MBtjqXQ/no-avatar.gif"}
            alt=""
            className="w-full lg:w-[700px] h-[200px] md:h-[350px] lg:h-[500px] rounded-lg object-cover "
          />
          <div className="">
            <h1 className="mb-[10px] md:text-2xl font-semibold">{data.title}</h1>
          </div>
        </div>
      )}
      {type === 'room' && (
            <div className='flex flex-col lg:flex-row items-center gap-[30px] lg:gap-[40px]'>
                <img
                    src={data.images[0] || "https://i.ibb.co/MBtjqXQ/no-avatar.gif"}
                    alt=""
                    className="w-full lg:w-[700px] h-[200px] md:h-[350px] lg:h-[500px] rounded-lg object-cover "
                />
                <div>
                    <h1 className="mb-[10px] md:text-2xl font-semibold">{data.title}</h1>
                    <div className="mb-[10px] md:text-lg">
                        <span className="font-bold mr-2">price:</span>
                        <span className="font-[300]">N{data.price}</span>
                    </div>
                    <div className="mb-[10px] md:text-lg">
                        <span className="font-bold mr-2">Max People:</span>
                        <span className="font-[300]">{data.maxPeople}</span>
                    </div>
                    <div className="mb-[10px] md:text-lg">
                        <span className="font-bold mr-2">Size:</span>
                        <span className="font-[300]">{data.size}</span>
                    </div>
                    <div className="mb-[10px] md:text-lg">
                        <span className="font-bold mr-2">Bedding:</span>
                        <span className="font-[300]">{data.bedding}</span>
                    </div>
                    <div className="mb-[10px] md:text-lg">
                        <span className="font-bold mr-2">Description:</span>
                        <span className="font-[300]">{data.description}</span>
                    </div>
                    <div className="mb-[10px] md:text-lg">
                        <span className="font-bold mr-2">Room Numbers:</span>
                        <span className="font-[300]">{
                            data.roomNumbers.map((roomNumber, i) => i ===data.roomNumbers.length - 1? `${roomNumber.number}` :`${roomNumber.number}, `)
                        }</span>
                    </div>
                </div>
            </div>
        )}
        {type === 'booking' && (
            <div className="flex flex-col lg:flex-row items-center gap-[30px] lg:gap-[40px]">
                <img
                    src={img || "https://i.ibb.co/MBtjqXQ/no-avatar.gif"}
                    alt=""
                    className="w-full lg:w-[500px] h-[200px] md:h-[350px] lg:h-[500px] rounded-lg object-cover "
                />
                <div>
                    <h1 className="mb-[10px] md:text-2xl font-semibold">{data.roomTitle}</h1>
                    <div className="mb-[10px] md:text-lg">
                        <span className="font-bold mr-2">Customer Name:</span>
                        <span className="font-[300]">{`${data.firstName} ${data.lastName}`}</span>
                    </div>
                    <div className="mb-[10px] md:text-lg">
                        <span className="font-bold mr-2">Confirmation Number:</span>
                        <span className="font-[300]">{data.confirmation}</span>
                    </div>
                    <div className="mb-[10px] md:text-lg">
                        <span className="font-bold mr-2">Email Address:</span>
                        <span className="font-[300]">{data.email}</span>
                    </div>
                    <div className="mb-[10px] md:text-lg">
                        <span className="font-bold mr-2">Cancelled:</span>
                        <span className="font-[300]">{data.cancelled ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="mb-[10px] md:text-lg">
                        <span className="font-bold mr-2">Phone Number:</span>
                        <span className="font-[300]">{data.phone}</span>
                    </div>
                    <div className="mb-[10px] md:text-lg">
                        <span className="font-bold mr-2">Check-in Date:</span>
                        <span className="font-[300]">{new Date(data.startDate).toLocaleString("en-uk", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}</span>
                    </div>
                    <div className="mb-[10px] md:text-lg">
                        <span className="font-bold mr-2">Check-out Date:</span>
                        <span className="font-[300]">{new Date(data.endDate).toLocaleString("en-uk", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}</span>
                    </div>
                    <div className="mb-[10px] md:text-lg">
                        <span className="font-bold mr-2">Payment Reference Number:</span>
                        <span className="font-[300]">{data.paymentReference? data.paymentReference : 'Cash Payement'}</span>
                    </div>
                    <div className="mb-[10px] md:text-lg">
                        <span className="font-bold mr-2">ID Number:</span>
                        <span className="font-[300]">{data.identity? data.identity : 'NIL'}</span>
                    </div>
                    <div className="mb-[10px] md:text-lg">
                        <span className="font-bold mr-2">Checked In:</span>
                        <span className="font-[300]">{data.checkedIn ? 'Yes': "No"}</span>
                    </div>
                    <div className="mb-[10px] md:text-lg">
                        <span className="font-bold mr-2">Checked Out:</span>
                        <span className="font-[300]">{data.checkedOut ? 'Yes': "No"}</span>
                    </div>
                    <div className="mb-[10px] md:text-lg">
                        <span className="font-bold mr-2">Channel:</span>
                        <span className="font-[300]">{data.registeredBy ? data.registeredBy: "Online booking"}</span>
                    </div>
                    <div className="mb-[10px] md:text-lg">
                        <span className="font-bold mr-2">Room Number(s):</span>
                        <span className="font-[300]">{data.roomNumbers.length >1 ? data.roomNumbers.map((roomNumber) => `${roomNumber}, `): data.roomNumbers.map((roomNumber) => `${roomNumber}`)}</span>
                    </div>
                </div>
            </div>
        )}
    </>
  )
}

export default SingleDetails;