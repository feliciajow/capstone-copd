import React, { useState, useEffect } from 'react';
import { Col, Row, Pagination, Alert } from 'antd';
import './style.css';

const Models = ({ email }) => {
    const [fetchModel, setfetchModel] = useState([]);
    //track alert messages error
    const [alert, setalert] = useState(null)

    useEffect(() => {
        if (email) {
            fetchModels();
        }
    }, [email])

    const fetchModels = () => {
        fetch('http://localhost:5000/model', {
            method: 'GET',
            headers: { "Content-Type": "application/json", "Email": email }, //telling server the type of content that we are sending with this req
        })
            .then((response) => {
                if (!response.ok) {
                    return response.json().then((data) => {
                        throw new Error(data.error || 'Fetch Model Fail.');
                    });
                }
                return response.json();
            })
            .then((model) => {
                setfetchModel(model);
            })
            .catch((error) => {
                setalert(
                    <Alert
                        description={error.message}
                        type="info"
                        showIcon
                    />
                )
            })
    };
    return (
        <>
            <div className="container">
                {alert}
                {!email && (
                    <Alert
                        description="You have to login to your account to view models."
                        type="info"
                        showIcon
                    />
                )}
                {fetchModel.map((model) => (
                    <div key={model.modelid} className="model-card">
                        <p className="title">Model ID {model.modelid}</p>
                        <p className="sub-title">True Positive: {model.true_positive}</p>
                        <p className="sub-title">True Negative: {model.true_negative}</p>
                        <p className="sub-title">False Positive: {model.false_positive}</p>
                        <p className="sub-title">False Negative: {model.false_negative}</p>
                    </div>
                ))}
                <div className="pagination">
                    <Pagination align="start" defaultCurrent={1} total={50} />
                </div>
            </div>
        </>
    )
}

export default Models;