import React from 'react';
import { Col, Row } from 'antd';


const Models=() =>{
    return(
        <>
        <div className="card-container" style={{ padding: "40px" }}>
            <Row>
                <Col span={6}></Col>
                <Col span={12} style={{ borderRadius:"20px", padding: "40px", boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px", textAlign:"left"}}>Model</Col>
                <Col span={6}></Col>
            </Row>
        </div>
        </>
    )
}
  
export default Models;