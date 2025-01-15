import React from 'react';
import * as excel from 'xlsx';
import { Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';

const ExcelTemplate=() =>{
    const downloadExcel = () => {
        //create new excel workbook
        const workbook = excel.utils.book_new();
        //append a worksheet to the workbook
        excel.utils.book_append_sheet(workbook)
        excel.writeFile(workbook,"training.xlsx")
    }
    return(
        <div className="card-container" style={{textAlign: 'left' }}>
            <h4>Download template file:</h4>
            <Button type="default" icon={<DownloadOutlined />} onClick={downloadExcel}>
                COPD Asthma Excel Template
            </Button>
        </div>
    );
};
  
export default ExcelTemplate;