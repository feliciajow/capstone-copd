import React, { useState, useEffect } from 'react';
import { Alert, Button } from 'antd';
import * as XLSX from 'xlsx';
import { Table, Spin } from 'antd';

const PreviewFile = ({ file, proceed, prev }) => {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const headers = [
    "Admit/Visit Date/Time",
    "Date of Birth",
    "Gender",
    "Race",
    "Death Date",
    "Case Type Description",
    "Primary Diagnosis Code (Mediclaim)",
    "Secondary Diagnosis Code Concat (Mediclaim)",
    "Discharge Date/Time",
    "Patient ID"
  ]
  //credits to https://www.youtube.com/watch?v=yd48ImBhC5U
  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = (e) => {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        let parsedData = XLSX.utils.sheet_to_json(sheet, {header: headers, defval:""});
        console.log(parsedData);
        //remove duplicated headers
        parsedData = parsedData.slice(1);

        //extract header from file
        const columnheader = Object.keys(parsedData[0] || {});
        console.log("Extracted headers:", columnheader);

        //validate header
        const checkheader = headers.filter((header) => !columnheader.includes(header));

        if (checkheader.length > 0) {
          setError(`Missing columns ${checkheader.join(", ")}. Please fix it before uploading.`)
          setLoading(false);
          return;
        }

        if (columnheader.length !== headers.length){
          setError(`Wrong number of columns. Please fix it before uploading.`)
          setLoading(false);
          return;
        }

        const parsedColumns = headers.map((header) => ({
          title: header,
          dataIndex: header,
          key: header,
        }));

        setColumns(parsedColumns);
        setData(parsedData);
        //stop the loading
        setLoading(false);
      };
    }
  }, [file]);

  return (
    <div>
      {error && <Alert message={error} type="error" showIcon />}
      {loading ? (
        <Spin size="large" style={{ display: 'block', margin: '30px auto' }} />) : (
        <>
          <Table
            columns={columns}
            dataSource={data}
            rowKey={(record, id) => id}
            pagination={{ pageSize: 50 }}
          />
          <br/>
          <Button className="btns" style={{ width: '20%', margin: '0 8px' }} type="default" onClick={prev}>
            Back
          </Button>
          {!error && (<Button className="btns" style={{ width: '20%', margin: '0 8px', backgroundColor: '#29b6f6' }} type="primary" onClick={proceed}>
            Proceed
          </Button>
          )}
        </>
      )}
    </div>
  );
};

export default PreviewFile;
