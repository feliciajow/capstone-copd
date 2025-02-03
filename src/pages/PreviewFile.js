import React, { useState, useEffect } from 'react';
import { Button } from 'antd';
import * as XLSX from 'xlsx';
import { Table } from 'antd';

const PreviewFile = ({ file }) => {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);

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
        const parsedData = XLSX.utils.sheet_to_json(sheet);
        const parsedColumns = Object.keys(parsedData[0] || {}).map((col, index) => ({
          title: col,
          dataIndex: col,
          key: index,
        }));

        setColumns(parsedColumns);
        setData(parsedData);
      };
    }
  }, [file]); 

  return (
    <div>
      {data.length > 0 && (
        <Table
          columns={columns}
          dataSource={data}
          rowKey={(record, id) => id}
          pagination={{ pageSize: 10 }}
        />
      )}
      <Button className="btns" style={{ width: '20%', backgroundColor: '#29b6f6' }} type="primary">
        Proceed
      </Button>
    </div>
  );
};

export default PreviewFile;
