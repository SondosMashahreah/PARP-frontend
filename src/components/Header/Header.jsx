import React from 'react'
import logo from './img/logo.png'
import link from 'react-router-dom'

const Header = () => {
  return (
    <div>
        <div className="left-header">
            <div className="logo">   
                <img
                    src={logo}
                    alt={t("Logo")}
                />
            </div>

            <div className="title">
                <h1>PARP</h1>
                <h2>Palestinian Action Research Platform</h2>
                <h2>المنصة الفلسطينية للبحوث الإجرائية</h2>
            </div>

        </div>

        <div className="search-box">
            

        </div>

    </div>
  )
}

export default Header
