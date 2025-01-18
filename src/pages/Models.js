import React from 'react';
import { Col, Row, Pagination  } from 'antd';
import './style.css';

const Models=() =>{
    return(
        <>
        <div className="model-card">
            <p className="title">Model</p>
        </div>
        <div className="pagination">
            <Pagination align="start" defaultCurrent={1} total={50} />
        </div>
        </>
    )
}
  
export default Models;