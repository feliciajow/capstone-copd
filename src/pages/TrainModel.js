// Step1Content.js
import React from 'react';
import { CloudUploadOutlined, DownloadOutlined } from '@ant-design/icons';
import { Upload, Button, Alert } from 'antd';
import ExcelTemplate from './downloadExcel';

const { Dragger } = Upload;

const TrainModel = ({ alert, setFile, fileupload, uploadModel }) => (
  <div>
    {alert}
    <h1 className="title">Upload File</h1>
    <div className="card-container">
      <ExcelTemplate />
      <br />
      <Dragger
        beforeUpload={(file) => {
          const isCSV = file.type === 'text/csv';
          const isxlsx = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          const isxls = file.type === 'application/vnd.ms-excel';
          if (!(isCSV || isxlsx || isxls)) {
            alert(
              <Alert
                description={`${file.name} is not an xlsx, xls, or csv file`}
                type="error"
                showIcon
              />
            );
            return Upload.LIST_IGNORE;
          }
          return true;
        }}
        name="file"
        multiple={false}
        maxCount={1}
        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
        action="http://localhost:5000/fileUpload"
        onChange={(info) => {
          //originFileObj is the file that we uploaded
          const { status, originFileObj } = info.file;
          if (status === 'done') {
            alert(null);
            setFile(originFileObj);
            fileupload(true);
          } else if (status === 'error') {
            fileupload(false);
          }
        }}
        onDrop={(e) => console.log('Dropped files', e.dataTransfer.files)}
        showUploadList={{
          showDownloadIcon: true,
          downloadIcon: (file) => (
            <a href={file.url || URL.createObjectURL(file.originFileObj)} download={file.name}>
              <DownloadOutlined />
            </a>
          ),
          extra: ({ size = 0 }) => (
            <span style={{ color: '#000000' }}>
              ({(size / 1024 / 1024).toFixed(2)} MB)
            </span>
          ),
        }}
      >
        <p className="ant-upload-drag-icon">
          <CloudUploadOutlined />
        </p>
        <p className="ant-upload-text">Click or drag file to this area to upload</p>
        <p className="ant-upload-hint">
          Support for a single file upload. Supported formats include csv, xls, or xlsx
        </p>
      </Dragger>
      <Button className="btns" style={{ width: '20%', backgroundColor: '#29b6f6' }} type="primary" onClick={uploadModel}>
        Proceed
      </Button>
    </div>
  </div>
);

export default TrainModel;
