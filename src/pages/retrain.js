import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CloudUploadOutlined } from '@ant-design/icons';
import { Button, Upload, Alert, Modal, Result } from 'antd';
import ExcelTemplate from './downloadExcel';

const { Dragger } = Upload;

const Retrain = () => {
    const navigate = useNavigate();
    //check if file has been uploaded
    const [fileupload, setfileupload] = useState(false);
    //track alert messages error or success
    const [alert, setalert] = useState(null)
    //open modal pop up
    const [isModalOpen, setIsModalOpen] = useState(false);

    // refer to antd library upload 
    const props = {
        beforeUpload: (file) => {
            const isCSV = file.type === 'text/csv';
            const isxlsx = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            const isxls = file.type === 'application/vnd.ms-excel';
            if (!(isCSV || isxlsx || isxls)) {
                setalert(
                    <Alert
                        description={`${file.name} is not an xlsx, xls, or csv file`}
                        type="error"
                        showIcon
                    />)
                return Upload.LIST_IGNORE;
            }
            return true;
        },

        name: 'file',
        multiple: false,
        maxCount: 1,
        accept: ".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel",
        action: 'http://localhost:5000/fileUpload',

        onChange(info) {
            const { status } = info.file;
            if (status === 'done') {
                setalert(null);
                setfileupload(true);
            } else if (status === 'error') {
                setfileupload(false);
            }
        },
        onDrop(e) {
            console.log('Dropped files', e.dataTransfer.files);
        },

        //display file size
        showUploadList: {
            extra: ({ size = 0 }) => (
                <span
                    style={{
                        color: '#000000',
                    }}
                >
                    ({(size / 1024 / 1024).toFixed(2)} MB)
                </span>
            )
        },
    };

    const uploadModel = () => {
        if (fileupload) {
            console.log('File uploaded successfully, showing modal...');
            setIsModalOpen(true);
        }
        else {
            setalert(
                <Alert
                    description="Please upload a valid file."
                    type="error"
                    showIcon
                />)
        }
    }

    return (
        //display file upload UI
        <>
            <div className="card-container" style={{ padding: "40px" }}>
                {alert}
                <ExcelTemplate />
                <br />
                <Dragger {...props}>
                    <p className="ant-upload-drag-icon">
                        <CloudUploadOutlined />
                    </p>
                    <p className="ant-upload-text">Click or drag file to this area to upload</p>
                    <p className="ant-upload-hint">
                        Support for a single file upload. Supported formats include csv, xls, or xlsx
                    </p>
                </Dragger>
            </div>
            <Button style={{ width: '95%' }} type="primary" onClick={uploadModel}>Train Model</Button>
            <Modal open={isModalOpen} footer={null} closable={false}>
                <Result
                    status="success"
                    title="File uploaded successfully."
                    subTitle="Model training may take 2-5 minutes, please wait patiently."
                    extra={[
                        <Button type="primary" onClick={() => navigate('/models')}>
                            View Models
                        </Button>,
                        <Button type="default" onClick={() => navigate('/dashboard')}>
                            Back to Dashboard
                        </Button>
                    ]}
                />
            </Modal>
        </>

    );
};


export default Retrain;

