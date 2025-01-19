import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CloudUploadOutlined, DownloadOutlined } from '@ant-design/icons';
import { Button, Upload, Alert, Modal, Result } from 'antd';
import ExcelTemplate from './downloadExcel';
import './style.css';

const { Dragger } = Upload;

const Retrain = ({ email }) => {
    const navigate = useNavigate();
    //check if file has been uploaded
    const [fileupload, setfileupload] = useState(false);
    //track alert messages error or success
    const [alert, setalert] = useState(null)
    //open success modal pop up
    const [isModalSuccess, setIsModalSuccess] = useState(false);
    //open confirm modal pop up
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
            showDownloadIcon: true,
            downloadIcon: (file) => (
                <a href={file.url || URL.createObjectURL(file.originFileObj)} download={file.name}>
                    <DownloadOutlined />
                </a>
            ),
            extra: ({ size = 0 }) => (
                <span
                    style={{
                        color: '#000000'
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

    const handleCancel = () => {
        setIsModalOpen(false);
    };
    const handleConfirm = () => {
        setIsModalSuccess(true);
    }

    return (
        //display file upload UI
        <>
            <div className="container">
                {alert}
                {!email && (
                    <Alert
                        description="You have to login to your account to train your file."
                        type="info"
                        showIcon
                    />
                )}
                <h1 className='title'>Upload File</h1>

                <div className="card-container">
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
                    <Button className="btns" style={{ width: '20%', backgroundColor: "#29b6f6" }} type="primary" onClick={uploadModel}>Train Model</Button>
                </div>
            </div>
            <Modal open={isModalOpen} footer={null}>
                <Result
                    status="warning"
                    title="Confirm uploading file?"
                    subTitle="Model training will proceed once upload is successful."
                    extra={[
                        <Button className="btns" type="default" onClick={handleCancel}>
                            Cancel
                        </Button>,
                        <Button className="btns" type="primary" onClick={handleConfirm}>
                            Confirm
                        </Button>
                    ]}
                />
            </Modal>
            <Modal open={isModalSuccess} footer={null} closable={false}>
                <Result
                    status="success"
                    title="Upload Successful"
                    subTitle="Please do not train new files in the next 5 minutes."
                    extra={[
                        <Button className="btns" type="default" onClick={() => navigate('/dashboard')}>
                            View Dashboard
                        </Button>,
                        <Button className="btns" type="primary" onClick={() => navigate('/models')}>
                            View Models
                        </Button>
                    ]}
                />
            </Modal>
        </>

    );
};

export default Retrain;

