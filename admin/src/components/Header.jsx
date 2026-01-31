import React from 'react'

const Header = ({ category, title }) => {
  return (
    <div className='mb-10'>
      <p className='text-lg text-gray-400 capitalize'>{category}</p>
      <p className='text-xl md:text-3xl font-extrabold tracking tight text-slate-900 capitalize'>
        {title}
      </p>
    </div>
  )
}

export default Header;