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
  ];

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = (e) => {
        try {
          const data = e.target.result;
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          
          // headers from the excel file
          const range = XLSX.utils.decode_range(sheet['!ref']);
          const actualHeaders = [];
        
          for (let C = range.s.c; C <= range.e.c; C++) {
            const cell = sheet[XLSX.utils.encode_cell({ r: 0, c: C })];
            actualHeaders.push(cell ? cell.v : undefined);
          }

          // Clean headers trim whitespace, normalize case
          const cleanHeaders = actualHeaders.map(header => 
            header ? header.toString().trim() : ''
          );
          
          // Validate headers
          const missingHeaders = headers.filter(required => 
            !cleanHeaders.some(actual => 
              actual === required
            )
          );

          if (missingHeaders.length > 0) {
            setError(`Missing required columns: ${missingHeaders.join(", ")}. Please fix your file before uploading.`);
            setLoading(false);
            return;
          }

          // If headers are valid, parse data
          let parsedData = XLSX.utils.sheet_to_json(sheet, {
            header: headers,
            defval: "",
            raw: false
          });

          // Remove header row
          parsedData = parsedData.slice(1);

          // Validate data
          if (parsedData.length === 0) {
            setError("The file appears to be empty. Please check the content and try again.");
            setLoading(false);
            return;
          }

          // Create columns for the table
          const parsedColumns = headers.map((header) => ({
            title: header,
            dataIndex: header,
            key: header,
          }));

          setColumns(parsedColumns);
          setData(parsedData);
          setError(null);
        } catch (err) {
          setError(`Error processing file: ${err.message}`);
        } finally {
          setLoading(false);
        }
      };

      reader.onerror = () => {
        setError("Error reading file. Please try again.");
        setLoading(false);
      };
    }
  }, [file]);

  return (
    <div>
      {error && <Alert message={error} type="error" showIcon />}
      {loading ? (
        <Spin size="large" style={{ display: 'block', margin: '30px auto' }} />
      ) : (
        <>
          {!error && (
            <Table
              columns={columns}
              dataSource={data}
              rowKey={(record, id) => id}
              pagination={{ pageSize: 50 }}
            />
          )}
          <br/>
          <Button 
            className="btns" 
            style={{ width: '20%', margin: '0 8px' }} 
            type="default" 
            onClick={prev}
          >
            Back
          </Button>
          {!error && (
            <Button 
              className="btns" 
              style={{ width: '20%', margin: '0 8px', backgroundColor: '#29b6f6' }} 
              type="primary" 
              onClick={proceed}
            >
              Proceed
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default PreviewFile;