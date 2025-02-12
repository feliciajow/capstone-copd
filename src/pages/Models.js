import React, { useState, useEffect } from 'react';
import { Table, Alert, Card } from 'antd';

const Models = ({ email }) => {
    const [fetchModel, setfetchModel] = useState([]);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        if (email) {
            fetchModels();
        }
    }, [email]);

    const fetchModels = () => {
        setLoading(true);
        fetch('http://localhost:5000/model', {
            method: 'GET',
            headers: { "Content-Type": "application/json", "Email": email },
        })
            .then((response) => {
                if (!response.ok) {
                    return response.json().then((data) => {
                        throw new Error(data.error || 'Fetch Model Failed');
                    });
                }
                return response.json();
            })
            .then((model) => {
                setfetchModel(model);
            })
            .catch((error) => {
                setAlert(
                    <Alert
                        description={error.message}
                        type="info"
                        showIcon
                        className="mb-4"
                    />
                );
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const columns = [
        {
            title: 'Model ID',
            dataIndex: 'modelid',
            key: 'modelid',
            width: '15%',
        },
        {
            title: 'True Positive',
            dataIndex: 'true_positive',
            key: 'true_positive',
            width: '15%',
        },
        {
            title: 'True Negative',
            dataIndex: 'true_negative',
            key: 'true_negative',
            width: '15%',
        },
        {
            title: 'False Positive',
            dataIndex: 'false_positive',
            key: 'false_positive',
            width: '15%',
        },
        {
            title: 'False Negative',
            dataIndex: 'false_negative',
            key: 'false_negative',
            width: '15%',
        },
        {
            title: 'Created at',
            dataIndex: 'timestamp',
            key: 'created_time',
            width: '25%',
            render: (text) => new Date(text).toLocaleString(),
        },
        {
            title: 'Model Data',
            dataIndex: 'model_data',
            key: 'model_data',
            width: '15%',
        },
    ];

    return (
        <div>
            <br/>
            {alert}
            {!email ? (
                <Alert description="You have to login to your account to view models." type="info" showIcon/>
            ) : (
                <Card style={{background: 'transparent'}}>
                    <Table
                        columns={columns}
                        dataSource={fetchModel}
                        rowKey="modelid"
                        loading={loading}
                        pagination={{
                            pageSize: 10,
                            showTotal: (total) => `Total ${total} models`,
                        }}
                    />
                </Card>
            )}
        </div>
    );
};

export default Models;